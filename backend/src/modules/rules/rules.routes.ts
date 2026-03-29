import { Router } from 'express';
import { ruleController } from './rules.controller';

const router = Router();

router.get('/', ruleController.getRules);
router.post('/', ruleController.createRule);
router.put('/:id', ruleController.updateRule);
router.delete('/:id', ruleController.deleteRule);

export default router;
