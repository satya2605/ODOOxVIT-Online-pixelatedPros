import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple password hashing using SHA-256 (no bcrypt needed for this project)
const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex');

export const authController = {
  /**
   * POST /api/auth/signup
   * Creates a new Company along with the initial Admin user.
   * Triggered only once per company (admin self-registers).
   */
  signup: async (req: Request, res: Response) => {
    try {
      const { name, email, password, confirmPassword, country, currency, companyName } = req.body;

      if (!name || !email || !password || !country || !currency || !companyName) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      // Ensure email is not already taken
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const hashedPassword = hashPassword(password);

      // Create Company and Admin User in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: companyName,
            currency: currency.toUpperCase(),
          },
        });

        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
            companyId: company.id,
          },
        });

        return { company, user };
      });

      const { user } = result;

      return res.status(201).json({
        message: 'Company and Admin account created successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      });
    } catch (error: any) {
      console.error('[auth.signup]', error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/auth/login
   * Authenticates admin, manager, or employee with email + password.
   */
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const hashedInput = hashPassword(password);
      if (hashedInput !== user.password) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      return res.status(200).json({
        message: 'Login successful.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          companyId: user.companyId,
          currency: user.company?.currency ?? 'USD',
          managerId: user.managerId,
        },
      });
    } catch (error: any) {
      console.error('[auth.login]', error);
      return res.status(500).json({ error: error.message });
    }
  },
};
