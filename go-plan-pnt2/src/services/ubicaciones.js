
import api from './api'

export async function obtenerProvinciasAPI(pais = 'AR') {
    const provincias = await api(
        `/ubicaciones/paises/${pais}/provincias`
    )

    if (!Array.isArray(provincias)) {
        throw new Error('No se pudieron obtener las provincias.')
    }

    return provincias.map(provincia => ({
        codigo: provincia.iso2,
        nombre: provincia.name
    }))
}

export async function obtenerCiudadesAPI(provincia) {
    const ciudades = await api(
        `/ubicaciones/paises/AR/provincias/${encodeURIComponent(provincia)}/ciudades`
    )

    if (!Array.isArray(ciudades)) {
        throw new Error('No se pudieron obtener las ciudades.')
    }

    return ciudades.map(ciudad => ({
        id: Number(ciudad.id),
        nombre: ciudad.name
    }))
}
