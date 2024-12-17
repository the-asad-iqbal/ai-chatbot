'use server';

import { z } from 'zod';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

// More robust schema validation
const authFormSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().toLowerCase().email({ message: "Invalid email format" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  error?: string;
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.pick({ email: true, password: true }).parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 'invalid_data',
        error: error.errors.map(e => e.message).join(', ')
      };
    }

    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Login failed'
    };
  }
};

export interface RegisterActionState {
  status:
  | 'idle'
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'user_exists'
  | 'invalid_data';
  error?: string;
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Check if user exists before creating
    const existingUser = await getUser(validatedData.email);
    if (existingUser && existingUser.length > 0) {
      return {
        status: 'user_exists',
        error: 'User with this email already exists'
      };
    }

    // Create user and sign in
    await createUser(
      validatedData.name,
      validatedData.email,
      validatedData.password
    );

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 'invalid_data',
        error: error.errors.map(e => e.message).join(', ')
      };
    }

    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Registration failed'
    };
  }
};