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
  // Try to find "TOTAL" line first (most reliable)
  let amount: number | null = null;

  // Priority 1: Look for TOTAL, GRAND TOTAL, TOTAL AMOUNT, AMOUNT DUE, BALANCE DUE
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

  // Priority 2: If no TOTAL found, grab the largest dollar amount on the receipt
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

  // Priority 3: Plain number patterns without $ sign
  if (amount === null) {
    const plainPattern = /(?:TOTAL|AMOUNT)[:\s]*([\d,]+\.?\d*)/i;
    const plainMatch = text.match(plainPattern);
    if (plainMatch) {
      const parsed = parseFloat(plainMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) amount = parsed;
    }
  }

  // --- DATE EXTRACTION ---
  let date: string | null = null;
  const datePatterns = [
    // MM-DD-YYYY or MM/DD/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD Mon YYYY or Mon DD, YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[,.\s]+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[,.\s]+(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Try to parse it into a normalized date string
      try {
        const rawDate = match[0];
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
          break;
        }
      } catch {}
      // Fallback: return the raw matched string
      date = match[0];
      break;
    }
  }

  // --- VENDOR / STORE NAME ---
  // Usually the first non-empty, non-asterisk line
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

      // Strip the data URI prefix if present (e.g., "data:image/png;base64,")
      const base64Data = receiptBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Save temp file for Tesseract (it works better with file paths)
      const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpFile = path.join(tmpDir, `receipt_${Date.now()}.png`);
      fs.writeFileSync(tmpFile, imageBuffer);

      console.log('[OCR] Processing receipt image...');

      // Run Tesseract OCR
      const result = await Tesseract.recognize(tmpFile, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const rawText = result.data.text;
      console.log('[OCR] Raw text extracted:\n', rawText);

      // Clean up temp file
      fs.unlinkSync(tmpFile);

      // Parse structured data from the raw text
      const parsed = parseReceiptText(rawText);

      res.status(200).json({
        amount: parsed.amount,
        description: parsed.description,
        date: parsed.date,
        vendor: parsed.vendor,
        lineItems: parsed.lineItems,
        rawText: parsed.rawText,
      });
    } catch (error: any) {
      console.error('[OCR] Error:', error.message);
      res.status(500).json({ error: 'OCR processing failed: ' + error.message });
    }
  },
};
