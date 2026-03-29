import { Router } from 'express';
import { userController } from './users.controller';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/send-password', userController.sendPassword);

export default router;
