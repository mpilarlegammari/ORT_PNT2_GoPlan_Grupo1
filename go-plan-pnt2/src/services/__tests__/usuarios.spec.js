import { afterEach, describe, expect, it, vi } from 'vitest'
import { signUp } from '../usuarios.js'

afterEach(() => vi.unstubAllGlobals())

describe('registro de usuarios', () => {
  it('envía el perfil al endpoint correcto sin confirmación ni rol', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201, ok: true, json: async () => ({ usuario: { nombre: 'Ana' } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    await signUp({ nombre: ' Ana ', apellido: ' Pérez ', email: ' ANA@example.com ', password: 'clave123', confirmarPassword: 'clave123', rol: 'admin' })
    const [url, opciones] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/usuarios')
    expect(opciones.method).toBe('POST')
    expect(opciones.credentials).toBe('include')
    expect(JSON.parse(opciones.body)).toEqual({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', password: 'clave123' })
  })

  it('propaga el error de email duplicado del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 409, ok: false, json: async () => ({ error: 'El email ya está registrado' }),
    }))
    await expect(signUp({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', password: 'clave123' })).rejects.toThrow('El email ya está registrado')
  })
})
