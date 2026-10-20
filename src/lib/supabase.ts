import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    cookieOptions: {
      // Guarda la sesión por 1 año (31536000 segundos)
      maxAge: 31536000,
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  }
)