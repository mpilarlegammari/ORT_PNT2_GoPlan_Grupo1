export async function guardarPerfilDemo({ nombre, apellido, correo }) {
  await new Promise((resolver) => setTimeout(resolver, 300))
  return { nombre, apellido, correo }
}
