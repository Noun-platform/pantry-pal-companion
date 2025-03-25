// This file is kept for compatibility with existing imports
// We're no longer using Supabase or Firebase, but keeping the file to avoid breaking imports

// Mock client that does nothing
export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signUp: async () => ({ error: null }),
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null }),
        in: () => ({ data: [], error: null })
      }),
      ilike: () => ({
        limit: () => ({ data: [], error: null })
      }),
      limit: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => ({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({ data: null, error: null })
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
      in: () => ({ data: null, error: null })
    })
  })
};
