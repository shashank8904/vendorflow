import { prisma } from "../lib/prisma";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";
import { ConflictError, UnauthorizedError } from "../errors";

export const authService = {
  async register(data: RegisterInput) {
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
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (!user || user.passwordHash !== data.password) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Return dummy token for MVP
    return { token: "dummy-jwt-token", user };
  }
};
