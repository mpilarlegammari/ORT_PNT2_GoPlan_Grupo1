import { afterEach, expect, it, vi } from 'vitest'
import { obtenerPaisesAPI, obtenerProvinciasAPI, obtenerCiudadesAPI } from '../ubicaciones'

afterEach(() => vi.unstubAllGlobals())

it('consulta la jerarquía de ubicaciones del backend y adapta sus respuestas', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ iso2: 'UY', name: 'Uruguay' }],
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ iso2: 'MO', name: 'Montevideo' }],
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 99, name: 'Montevideo' }],
    })
  vi.stubGlobal('fetch', fetchMock)
  expect(await obtenerPaisesAPI()).toEqual([{ codigo: 'UY', nombre: 'Uruguay' }])
  expect(await obtenerProvinciasAPI('UY')).toEqual([{ codigo: 'MO', nombre: 'Montevideo' }])
  expect(await obtenerCiudadesAPI('MO', 'UY')).toEqual([{ id: 99, nombre: 'Montevideo' }])
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    '/api/ubicaciones/paises',
    '/api/ubicaciones/paises/UY/provincias',
    '/api/ubicaciones/paises/UY/provincias/MO/ciudades',
  ])
})
