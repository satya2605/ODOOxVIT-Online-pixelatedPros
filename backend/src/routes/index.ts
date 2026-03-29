import { Router } from 'express';

const router = Router();

// Modular Route implementations (Stubbed for scaling)
router.use('/auth', (req, res) => res.json({ message: 'Auth routes placeholder' }));
router.use('/users', (req, res) => res.json({ message: 'Users routes placeholder' }));
router.use('/expenses', (req, res) => res.json({ message: 'Expenses routes placeholder' }));
router.use('/approvals', (req, res) => res.json({ message: 'Approvals routes placeholder' }));
router.use('/rules', (req, res) => res.json({ message: 'Rules routes placeholder' }));
router.use('/analytics', (req, res) => res.json({ message: 'Analytics routes placeholder' }));

// System Check
router.get('/health', (req, res) => res.json({ status: 'OK' }));

export default router;
