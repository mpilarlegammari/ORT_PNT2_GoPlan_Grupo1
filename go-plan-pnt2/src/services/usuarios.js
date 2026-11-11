import api from './api.js'

export function signUp({ nombre, apellido, email, password }) {
  return api('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  })
}
