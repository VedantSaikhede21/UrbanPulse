import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'citizen' | 'officer' | 'dept_head' | 'admin' | 'super_admin';

export interface AppUser {
  id: string;
  email?: string;
  role: UserRole;
  name?: string;
}

// Sign in with Google (citizen login)
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/citizen/dashboard`
    }
  });
  return { error: error?.message ?? null };
}

// Email + password login (staff)
export async function signInWithPassword(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user ?? null, error: error?.message ?? null };
}

// Sign out
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Determine role from user metadata or email domain
export function getRoleFromUser(user: User): UserRole {
  const meta = user.user_metadata;
  if (meta?.role) return meta.role as UserRole;
  
  // If the user signed in via Google OAuth, they are a citizen
  if (user.app_metadata?.provider === 'google') return 'citizen';
  
  // Staff emails default to officer role; refine via admin panel later
  if (user.email) return 'officer';
  
  return 'citizen';
}
