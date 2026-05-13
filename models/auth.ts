import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const signinSchema = signupSchema.omit({ name: true });

/** Superset shape used by the form regardless of mode. */
export type AuthFormValues = z.infer<typeof signupSchema>;

export type AuthMode = "signin" | "signup";
