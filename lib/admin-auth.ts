import { createSupabaseServerClient } from '@/lib/supabase-server';

export interface AdminContext {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: {
    id: string;
    email?: string;
  };
  role: string;
}

/**
 * Ensure the current request belongs to an authenticated Supabase user
 * with an `admin` role in the `profiles` table.
 *
 * Returns `AdminContext` when authorized, otherwise `null`.
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    return null;
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? undefined,
    },
    role: profile.role,
  };
}

