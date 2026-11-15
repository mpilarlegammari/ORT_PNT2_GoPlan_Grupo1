import api from './api.js'

async function solicitarPerfil(ruta, opciones) {
  let datos
  try {
    datos = await api(ruta, opciones)
  } catch (error) {
    if (error.status === 401) throw new Error('Iniciá sesión para consultar o editar tu perfil.')
    throw error
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

export const consultarPerfil = () => solicitarPerfil('/auth/me')

export const guardarPerfil = ({ nombre, apellido, correo }) =>
  solicitarPerfil('/usuarios/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, email: correo }),
  })
