async function solicitarPerfil(ruta, opciones) {
  const respuesta = await fetch(ruta, { credentials: 'same-origin', ...opciones })
  const datos = await respuesta.json().catch(() => null)

  if (respuesta.status === 401) {
    throw new Error('Iniciá sesión para consultar o editar tu perfil.')
  }
  if (!respuesta.ok) {
    throw new Error(typeof datos?.error === 'string' ? datos.error : 'No pudimos acceder a tu perfil.')
  }

  const usuario = datos?.usuario
  if (!usuario || typeof usuario.nombre !== 'string' || typeof usuario.email !== 'string' ||
      typeof usuario.rol !== 'string') {
    throw new Error('El servidor no devolvió un perfil válido.')
  }

  return {
    nombre: usuario.nombre,
    apellido: usuario.apellido ?? '',
    correo: usuario.email,
    rol: usuario.rol,
  }
}

export const consultarPerfil = () => solicitarPerfil('/api/auth/me')

export const guardarPerfil = ({ nombre, apellido, correo }) =>
  solicitarPerfil('/api/usuarios/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, email: correo }),
  })
