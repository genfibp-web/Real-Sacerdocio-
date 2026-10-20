import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Usamos el nuevo nombre de la variable
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! 
)