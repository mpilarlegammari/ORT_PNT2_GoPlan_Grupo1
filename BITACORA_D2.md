# 📋 Bitácora de Desarrollo — Desarrollador 2 (Carlos)
**Proyecto:** GoPlan — Plataforma de Actividades y Reservas  
**Materia:** Programación en Nuevas Tecnologías 2 (ORT)  
**Última actualización:** 13 de Noviembre de 2026  
**Rama de trabajo:** `feature/catalogo-actividades`  

---

## 🚀 Lo que hicimos hoy: Integración con Backend y Testing

### 1. Integración con `origin/main` (Trabajo de D1 y D3)
- Realizamos un merge limpio trayendo:
  - El sistema de autenticación (Login con credenciales y Login con Google).
  - La configuración de variables de entorno para el proxy de Vite (`.env.example` y `.env.local`).
  - El cliente HTTP compartido `src/services/api.js`.
- Resolvimos los conflictos en `App.vue`, `src/router/index.js` y `main.css`, manteniendo la barra superior moderna de GoPlan con tus enlaces (Actividades, Favoritos con badge contador, Mis Reservas, Perfil) y ocultándola adecuadamente en pantallas de login/registro.

### 2. Conexión del Catálogo al Backend REST
- Creamos el servicio `src/services/actividades.js`:
  - Consume la ruta `/api/actividades` a través del proxy hacia Render (`https://goplan-tp2.onrender.com`).
  - Implementa un **fallback local resiliente**: si el backend de Render se encuentra suspendido o sin actividades cargadas, carga automáticamente los datos de demostración de `actividadesIniciales.js`. ¡El catálogo nunca queda roto!
- Conectamos la acción `cargarActividades()` en `src/stores/actividades.js` y se invoca automáticamente en el ciclo de vida `onMounted` de `ActividadesView.vue`.

### 3. Calidad de Código y Testing Unitario (Requisito del TP)
- Creamos `src/stores/__tests__/actividades.spec.js` con **5 tests unitarios** en Vitest:
  1. Inicialización correcta de actividades activas y futuras.
  2. Alternancia de favoritos (agregar, persistir en store y quitar).
  3. Filtrado reactivo por texto de búsqueda.
  4. Filtrado por categoría seleccionada.
  5. Restablecimiento completo de filtros.
- Corregimos la compatibilidad de estilos para que el test `Acceso.spec.js` de autenticación pase al 100%.

### 4. Historial de Commits
1. `5d349d7`: `feat(actividades): agregar store modular con persistencia y datos iniciales`
2. `79a1a09`: `feat(actividades): agregar componentes Card, Filtros y Banner Destacado estilo Ticketek`
3. `1312516`: `feat(catalogo): implementar vistas de catalogo, favoritos, detalle y layout con filtros y busqueda`
4. `8069863`: `docs: agregar bitacora de desarrollo D2 con resumen de avances y pendientes`
5. `fcbd120`: `merge: integrar cambios de origin/main (backend proxy, login y servicios)`
6. `e8bace1`: `feat(api): conectar catalogo de actividades a servicio API con fallback local y tests unitarios`

---

## 🔍 ¿Qué falta antes de dar por cerrada tu parte (D2)?

Para dejar tu entrega sobresaliente y lista para defender con nota alta:

### 1. Ficha de Detalle de Actividad (`ActividadDetalleView.vue`) — **LO PRÓXIMO**
Actualmente tiene un diseño provisorio muy simple. Falta convertirlo en una experiencia visual premium estilo Ticketek:
- **Hero Header**: Foto en alta definición en tamaño completo, con badges flotantes de categoría y fecha.
- **Grilla en dos columnas (estilo Ticketek/Eventbrite)**:
  - **Columna izquierda (Contenido principal)**:
    - Descripción extendida de la experiencia.
    - Qué incluye el taller/actividad (materiales, duración, nivel requerido, idioma).
    - Mapa o ficha visual de ubicación (dirección exacta, ciudad, provincia y referencias de llegada).
    - Datos del organizador / facilitador.
    - Políticas de cancelación claras (alineado con la regla de 12 horas que implementó D3).
  - **Columna derecha (Caja flotante de Reserva / Sticky Checkout)**:
    - Precio en pesos argentinos destacado.
    - Cupos disponibles en tiempo real con barra visual de disponibilidad (ej. "¡Quedan solo 3 lugares!").
    - Selector interactivo de cantidad de entradas / cupos a reservar.
    - Resumen del total a pagar en puntos / dinero.
    - Botón principal de **"Reservar lugar"** (preparado con validaciones de cupo para integrarse con la store de reservas de D3).
    - Botón de favoritos accesible.

### 2. Galería de Fotos en Alta Calidad (`src/data/actividadesIniciales.js`)
Reemplazar las fotos de prueba por imágenes seleccionadas de altísima resolución (gastronomía, fotografía, yoga, cerámica, meditación, enología) con una paleta de colores cuidada y profesional.

### 3. Pantalla de Favoritos (`FavoritosView.vue`)
- Mejorar los estados vacíos con ilustraciones o iconos atractivos.
- Botón rápido para "Vaciar todos los favoritos".
- Acción para compartir o ver disponibilidad.
