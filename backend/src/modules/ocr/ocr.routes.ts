import { Router } from 'express';
import { ocrController } from './ocr.controller';

const router = Router();

// POST /api/ocr/scan
router.post('/scan', ocrController.scanReceipt);

export default router;
