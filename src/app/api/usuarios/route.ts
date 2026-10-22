import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

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

    const { email, password, nombre, rol, comunidad_slug, permisos } = await request.json();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw new Error("Error en Auth: " + authError.message);
    if (!authData.user) throw new Error("No se pudo crear el usuario");

    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .insert([{ 
        id: authData.user.id, 
        nombre, 
        rol, 
        comunidad_slug: comunidad_slug || null,
        password_temporal: password,
        permisos: permisos || [] // <-- GUARDAMOS LOS PERMISOS AQUÍ
      }]);

    if (profileError) throw new Error("Error en Perfil: " + profileError.message);

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// FUNCIÓN PARA ELIMINAR COMPLETAMENTE AL USUARIO
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
    if (id === SUPER_ADMIN_ID) return NextResponse.json({ error: "No puedes eliminar al Super Admin." }, { status: 403 });

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

// 🔄 ACTUALIZADO: Maneja contraseña, roles y permisos
export async function PUT(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Faltan variables de entorno." }, { status: 500 });
    }

    const { id, newPassword, requesterId, newRole, newCommunity, newPermisos } = await request.json();

    // 1. Verificar que quien hace la petición es el Súper Admin
    if (requesterId !== SUPER_ADMIN_ID) {
      return NextResponse.json({ error: "No tienes permiso para realizar esta acción." }, { status: 403 });
    }

    if (!id) return NextResponse.json({ error: "Falta el ID del usuario." }, { status: 400 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const updates: any = {};

    // 2. Si envían nueva contraseña, actualizamos en Auth y en Perfiles
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
      }
      
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { password: newPassword }
      );

      if (authError) throw authError;
      updates.password_temporal = newPassword;
    }

    // 3. Si envían nuevo rol, comunidad o permisos, los preparamos
    if (newRole) updates.rol = newRole;
    if (newCommunity !== undefined) updates.comunidad_slug = newCommunity;
    if (newPermisos !== undefined) updates.permisos = newPermisos;

    // 4. Actualizamos la tabla de perfiles si hay algo que cambiar
    if (Object.keys(updates).length > 0) {
      const { error: dbError } = await supabaseAdmin
        .from('perfiles')
        .update(updates)
        .eq('id', id);

      if (dbError) throw dbError;
    }

    return NextResponse.json({ success: true, message: "Datos actualizados correctamente." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}