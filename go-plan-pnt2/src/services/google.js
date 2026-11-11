let cargaGoogle

export function cargarGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!cargaGoogle)
    cargaGoogle = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client?hl=es'
      script.async = true
      const fallar = (mensaje) => {
        clearTimeout(timeout)
        script.remove()
        cargaGoogle = null
        reject(new Error(mensaje))
      }
      const timeout = setTimeout(
        () => fallar('Google tardó demasiado en responder. Reintentá.'),
        15000,
      )
      script.onload = () => {
        if (!window.google?.accounts?.id) return fallar('No se pudo inicializar Google.')
        clearTimeout(timeout)
        resolve()
      }
      script.onerror = () => fallar('No se pudo cargar Google. Revisá tu conexión.')
      document.head.append(script)
    })
  return cargaGoogle
}
