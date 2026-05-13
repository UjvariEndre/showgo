import { z } from "zod";

export const authFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

export type AuthMode = "signin" | "signup";
