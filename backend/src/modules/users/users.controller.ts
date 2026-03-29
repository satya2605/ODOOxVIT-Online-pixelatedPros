import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userController = {
  createUser: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'CREATE_USER', payload: user })
      const { name, email, role, managerId, companyId, password } = req.body;
      const user = await prisma.user.create({
        data: {
          name,
          email,
          role: role || 'EMPLOYEE',
          managerId,
          companyId: companyId || 'default-company',
          password: password || 'default-password-hash'
        }
      });
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'UPDATE_USER', payload: user })
      const { id } = req.params;
      const { name, email, role, managerId } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: { name, email, role, managerId }
      });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'DELETE_USER', payload: id })
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
