import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Faltan variables de entorno." }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, password, nombre, rol, comunidad_slug } = await request.json();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw new Error("Error en Auth: " + authError.message);
    if (!authData.user) throw new Error("No se pudo crear el usuario");

    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .insert([{ id: authData.user.id, nombre, rol, comunidad_slug: comunidad_slug || null }]);

    if (profileError) throw new Error("Error en Perfil: " + profileError.message);

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// NUEVA FUNCIÓN PARA ELIMINAR COMPLETAMENTE AL USUARIO
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Borrar de la tabla de perfiles
    await supabaseAdmin.from('perfiles').delete().eq('id', id);

    // 2. Borrar de Authentication (esto lo saca del sistema por completo)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw new Error("Error al borrar de Auth: " + authError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}