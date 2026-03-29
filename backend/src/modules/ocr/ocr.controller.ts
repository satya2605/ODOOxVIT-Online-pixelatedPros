import { Request, Response } from 'express';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';

/**
 * Parses OCR-extracted text to find total amount, date, vendor, and line items.
 * Supports multiple receipt formats and layouts.
 */
function parseReceiptText(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // --- AMOUNT EXTRACTION ---
  let amount: number | null = null;

  const totalPatterns = [
    /(?:GRAND\s*TOTAL|TOTAL\s*AMOUNT|TOTAL\s*DUE|AMOUNT\s*DUE|BALANCE\s*DUE|SUB\s*TOTAL|SUBTOTAL|TOTAL)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})\s*(?:TOTAL|DUE)/i,
  ];

  for (const pattern of totalPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        const parsed = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }
    if (amount !== null) break;
  }

  if (amount === null) {
    const allAmounts: number[] = [];
    const dollarPattern = /\$\s*([\d,]+\.?\d*)/g;
    let dollarMatch;
    while ((dollarMatch = dollarPattern.exec(text)) !== null) {
      const parsed = parseFloat(dollarMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        allAmounts.push(parsed);
      }
    }
    if (allAmounts.length > 0) {
      amount = Math.max(...allAmounts);
    }
  }

  // --- DATE EXTRACTION ---
  let date: string | null = null;
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[,.\s]+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[,.\s]+(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const rawDate = match[0];
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
          break;
        }
      } catch {}
      date = match[0];
      break;
    }
  }

  // --- VENDOR / STORE NAME ---
  let vendor: string | null = null;
  for (const line of lines) {
    const cleaned = line.replace(/[*\-=_#]/g, '').trim();
    if (cleaned.length > 2 && !/^(RECEIPT|DATE|TIME|TERMINAL|ORDER)/i.test(cleaned)) {
      vendor = cleaned;
      break;
    }
  }

  // --- LINE ITEMS ---
  const lineItems: Array<{ name: string; qty: number; price: number }> = [];
  const itemPattern = /(\d+)\s*x\s+(.+?)\s+\$?([\d,]+\.?\d*)/i;
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      lineItems.push({
        qty: parseInt(match[1]),
        name: match[2].trim(),
        price: parseFloat(match[3].replace(/,/g, '')),
      });
    }
  }

  // --- DESCRIPTION BUILDER ---
  let description = '';
  if (vendor) description += `Vendor: ${vendor}. `;
  if (lineItems.length > 0) {
    description += 'Items: ' + lineItems.map(i => `${i.qty}x ${i.name} ($${i.price})`).join(', ') + '. ';
  }
  if (!description) {
    description = 'Receipt processed by OCR Engine';
  }

  return { amount, date, description: description.trim(), vendor, lineItems, rawText: text };
}

export const ocrController = {
  scanReceipt: async (req: Request, res: Response) => {
    try {
      const { receiptBase64 } = req.body;

      if (!receiptBase64) {
        return res.status(400).json({ error: 'No receipt image provided' });
      }

      // Strip the data URI prefix if present
      const base64Data = receiptBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Permanent file storage in backend/public/uploads
      const fileName = `receipt_${Date.now()}.png`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, imageBuffer);

      console.log(`[OCR] Saved receipt to ${filePath}. Processing...`);

      // Run Tesseract OCR using the saved file
      const result = await Tesseract.recognize(filePath, 'eng');

      const rawText = result.data.text;
      const parsed = parseReceiptText(rawText);

      // Return real data + accessible static URL
      res.status(200).json({
        amount: parsed.amount,
        description: parsed.description,
        date: parsed.date,
        vendor: parsed.vendor,
        lineItems: parsed.lineItems,
        receiptUrl: `/uploads/${fileName}`, // Assuming public folder is served statically
        rawText: parsed.rawText,
      });
    } catch (error: any) {
      console.error('[OCR] Error:', error.message);
      res.status(500).json({ error: 'OCR processing failed: ' + error.message });
    }
  },
};

