import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z.email({ message: 'Invalid email address' }),
    // password must be at least 6 characters with at least one uppercase letter and one number
    password: z.string().regex(/^(?=.*[A-Z])(?=.*\d).{6,}$/, {
      message:
        'Password must be at least 6 characters, include one uppercase letter and one number',
    }),
    confirmPassword: z.string(),
    username: z
      .string()
      .min(3, { message: 'Minimum username length is 3 characters' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type SignUpData = z.infer<typeof signUpSchema>;
