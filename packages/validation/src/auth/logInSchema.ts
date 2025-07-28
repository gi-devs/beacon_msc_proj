import { z } from 'zod';

export const logInSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LogInData = z.infer<typeof logInSchema>;
