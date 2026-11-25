import api from './api'

export async function obtenerPaisesAPI() {
  const paises = await api('/ubicaciones/paises')
  if (!Array.isArray(paises)) throw new Error('No se pudieron obtener los países.')
  return paises.map((pais) => ({ codigo: pais.iso2, nombre: pais.name }))
}

export async function obtenerProvinciasAPI(pais) {
  const provincias = await api(`/ubicaciones/paises/${encodeURIComponent(pais)}/provincias`)
  if (!Array.isArray(provincias)) throw new Error('No se pudieron obtener las provincias.')
  return provincias.map((provincia) => ({ codigo: provincia.iso2, nombre: provincia.name }))
}

export async function obtenerCiudadesAPI(provincia, pais) {
  const ciudades = await api(
    `/ubicaciones/paises/${encodeURIComponent(pais)}/provincias/${encodeURIComponent(provincia)}/ciudades`,
  )
  if (!Array.isArray(ciudades)) throw new Error('No se pudieron obtener las ciudades.')
  return ciudades.map((ciudad) => ({ id: Number(ciudad.id), nombre: ciudad.name }))
}
