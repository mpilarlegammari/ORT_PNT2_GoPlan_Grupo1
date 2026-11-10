import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import * as servicio from '@/services/reservasDemo'
import MisReservas from '../MisReservas.vue'

describe('Confirmación de cancelación local', () => {
  let wrapper

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-20T05:00:00-03:00'))
    wrapper = mount(MisReservas)
    await vi.runAllTimersAsync()
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  async function pulsar(texto) {
    const boton = wrapper.findAll('button').find((boton) => boton.text() === texto)
    expect(boton).toBeDefined()
    await boton.trigger('click')
  }

  it('permite volver sin cancelar la reserva', async () => {
    await pulsar('Solicitar cancelación')
    await pulsar('Volver')
    expect(wrapper.find('.confirmacion').exists()).toBe(false)
    expect(wrapper.find('article').text()).toContain('Confirmada')
  })

  it('conserva la reserva cancelada y actualiza los filtros', async () => {
    await wrapper.find('select').setValue('confirmada')
    await pulsar('Solicitar cancelación')
    await pulsar('Confirmar cancelación')
    expect(wrapper.find('article').text()).toContain('Confirmada')
    expect(wrapper.get('button[disabled]:last-child').text()).toBe('Cancelando…')
    await vi.runAllTimersAsync()
    expect(wrapper.text()).toContain('No hay reservas para este filtro.')
    expect(wrapper.find('[role="status"]').text()).toContain('Cancelaste la reserva')
    expect(wrapper.find('.confirmacion').exists()).toBe(false)

    await wrapper.find('select').setValue('cancelada')
    expect(wrapper.findAll('article')).toHaveLength(2)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('rechaza la confirmación si el plazo venció después de seleccionar', async () => {
    await pulsar('Solicitar cancelación')
    vi.setSystemTime(new Date('2026-11-20T06:00:01-03:00'))
    await pulsar('Confirmar cancelación')
    await vi.runAllTimersAsync()
    expect(wrapper.find('[role="status"]').text()).toContain('12 horas de anticipación')
    expect(wrapper.find('article').text()).toContain('Confirmada')
    expect(wrapper.find('.confirmacion').exists()).toBe(false)
  })
})

it('distingue carga, error y una consulta vacía después de reintentar', async () => {
  const consulta = vi
    .spyOn(servicio, 'consultarReservasDemo')
    .mockRejectedValueOnce(new Error('Error de consulta'))
    .mockResolvedValueOnce([])
  const wrapper = mount(MisReservas)

  try {
    expect(wrapper.text()).toContain('Cargando reservas')
    expect(wrapper.text()).not.toContain('Todavía no tenés reservas')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('No pudimos cargar tus reservas')
    expect(wrapper.text()).not.toContain('Todavía no tenés reservas')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Todavía no tenés reservas')
  } finally {
    wrapper.unmount()
    consulta.mockRestore()
  }
})
