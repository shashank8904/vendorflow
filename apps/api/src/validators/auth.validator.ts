import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  userName: z.string().min(2, "User name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const googleLoginSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).default("Google User"),
  uid: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
