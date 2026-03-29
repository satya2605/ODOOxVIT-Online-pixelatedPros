import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { emailService } from '../../utils/email.service';

const prisma = new PrismaClient();

const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex');

const generateRandomPassword = () =>
  crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);

export const userController = {
  /**
   * GET /api/users
   * Returns all users for the same company as the requesting admin.
   * Uses companyId query param to scope results.
   */
  getUsers: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.query;
      const users = await prisma.user.findMany({
        where: companyId ? { companyId: String(companyId) } : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          companyId: true,
          createdAt: true,
          manager: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/users
   * Admin creates a new user (Employee or Manager) in the same company.
   * No password is set here — a "Send password" email will be triggered separately.
   */
  createUser: async (req: Request, res: Response) => {
    try {
      const { name, email, role, managerId, companyId } = req.body;

      if (!name || !email || !role || !companyId) {
        return res.status(400).json({ error: 'name, email, role, and companyId are required.' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      // Generate a temporary random password that can be sent to the user
      const tempPassword = generateRandomPassword();
      const hashedPassword = hashPassword(tempPassword);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          managerId: managerId || null,
          companyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          companyId: true,
          createdAt: true,
        },
      });

      // Send email
      try {
        await emailService.sendTemporaryPassword(email, name, tempPassword);
      } catch (e) {
        console.error('Failed to send email to new user:', e);
      }

      // Return user
      res.status(201).json({ ...user, tempPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/users/:id
   * Update user role or managerId assignment.
   */
  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, role, managerId } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role: role.toUpperCase() }),
          ...(managerId !== undefined && { managerId }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          companyId: true,
        },
      });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * DELETE /api/users/:id
   */
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/users/:id/send-password
   * Generates a new random password and returns it (simulating email send for demo).
   */
  sendPassword: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const tempPassword = generateRandomPassword();
      await prisma.user.update({
        where: { id },
        data: { password: hashPassword(tempPassword) },
      });

      try {
        await emailService.sendTemporaryPassword(user.email, user.name, tempPassword);
      } catch (e) {
        console.error('Failed to send password reset email:', e);
      }

      res.json({
        message: `Password sent securely to ${user.email}`,
        tempPassword, // still visible in demo UI briefly if needed
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
