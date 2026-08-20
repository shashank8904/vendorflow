import { prisma } from "../lib/prisma";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";
import { ConflictError, UnauthorizedError } from "../errors";

export const authService = {
  async register(data: RegisterInput) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser) {
        throw new ConflictError("Email already in use");
      }

      const company = await prisma.company.create({
        data: {
          name: data.companyName,
        }
      });

      const user = await prisma.user.create({
        data: {
          companyId: company.id,
          name: data.userName,
          email: data.email,
          passwordHash: data.password, // In real app: hash it
          role: "ADMIN"
        }
      });

      return { company, user };
    } catch (error) {
      console.error("[AuthService] Register Error:", error);
      throw error;
    }
  },

  async login(data: LoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (!user || user.passwordHash !== data.password) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Return dummy token for MVP
      return { token: "dummy-jwt-token", user };
    } catch (error) {
      console.error("[AuthService] Login Error:", error);
      throw error;
    }
  },

  async googleLogin(data: import("../validators/auth.validator").GoogleLoginInput) {
    try {
      let user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { company: true }
      });

      if (!user) {
        // Create a new company and user for Google OAuth users
        const company = await prisma.company.create({
          data: {
            name: `${data.name}'s Company`,
          }
        });

        user = await prisma.user.create({
          data: {
            companyId: company.id,
            name: data.name,
            email: data.email,
            passwordHash: data.uid, // We use uid as a dummy password for Google users
            role: "ADMIN"
          },
          include: { company: true }
        });
      }

      // Return dummy token for MVP
      return { token: "dummy-jwt-token", user };
    } catch (error) {
      console.error("[AuthService] Google Login Error:", error);
      throw error;
    }
  }
};
