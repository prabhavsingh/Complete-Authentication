import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: "Passowrds don't match",
  });

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});
export const resetPasswordSchema = z.object({
  email: z.email(),
  password:z. 
});
