# 📋 Bitácora de Desarrollo — Desarrollador 2 (Carlos)
**Proyecto:** GoPlan — Plataforma de Actividades y Reservas  
**Materia:** Programación en Nuevas Tecnologías 2 (ORT)  
**Fecha de sesión:** 10 de Noviembre de 2026  
**Rama de trabajo:** `feature/catalogo-actividades`  

---

## 🚀 ¿Qué hicimos hoy?

Trabajamos en el alcance del **Desarrollador 2 (D2)**: Catálogo, filtros, detalle y favoritos con diseño inspirado en la grilla y tarjetas de **Ticketek Argentina**.

### 1. Arquitectura y Modularización
- **Store en Pinia (`src/stores/actividades.js`)**:
  - Modularizamos la lógica de estado separando datos duros y persistencia.
  - Implementamos getters computados para filtrar por texto, categoría, actividades activas y actividades futuras (requerimiento explícito del TP).
  - Métodos preparados para favoritos (`toggleFavorito`, `esFavorito`) y soporte CRUD para futura integración con D4 (Admin).
- **Módulo de Datos Iniciales (`src/data/actividadesIniciales.js`)**:
  - Modelo idéntico al acordado con el equipo y el deploy de Render (`nombre`, `descripcion`, `categoria`, `fecha`, `cupo`, `precio`, `direccion`, `ciudad`, `provincia`, `pais`, `imagen`, `destacada`, `activa`).
- **Utilidad de Almacenamiento (`src/utils/storage.js`)**:
  - Funciones reutilizables con manejo de errores `try/catch` para persistencia en `localStorage`.

### 2. Componentes UI (Estilo Ticketek)
- **`ActividadCard.vue`**:
  - Imagen con efecto *hover zoom*.
  - Badge de categoría flotante.
  - Botón de corazón para agregar/quitar de favoritos con animación reactiva.
  - Formato de fecha argentina (`Intl.DateTimeFormat`) y moneda en pesos (`Intl.NumberFormat`).
  - Botón "Ver detalle" enlazado a la ruta dinámica.
- **`ActividadFiltros.vue`**:
  - Barra de búsqueda redondeada con icono de lupa y botón para limpiar texto.
  - Selector horizontal con chips/pills de categorías ("Todas", "Gastronomía", "Fotografía", "Bienestar", "Arte y Diseño").
  - Contador reactivo de resultados y botón para restablecer filtros.
- **`ActividadDestacada.vue`**:
  - Banner horizontal destacado en la parte superior para eventos principales.

### 3. Vistas y Enrutamiento
- **`ActividadesView.vue`**: Vista principal del catálogo con grilla responsiva (3 columnas desktop, 2 tablet, 1 mobile) y estado vacío amigable cuando no hay coincidencias.
- **`FavoritosView.vue`**: Vista dedicada a las actividades guardadas por el usuario.
- **`ActividadDetalleView.vue`**: Estructura base para el detalle individual de la actividad.
- **`App.vue` & `main.css`**: Barra de navegación superior integrada con logo GoPlan, enlaces a Actividades, Favoritos (con badge contador reactivo), Mis Reservas y Perfil, corrigiendo el estilo boilerplate de Vite.
- **`router/index.js`**: Rutas conectadas (`/`, `/actividades`, `/actividades/:id`, `/favoritos`).

### 4. Control de Versiones (Git)
Se realizaron 3 commits atómicos y se subieron a GitHub en la rama **`feature/catalogo-actividades`**, manteniendo la rama principal `main` 100% protegida:
1. `5d349d7`: `feat(actividades): agregar store modular con persistencia y datos iniciales`
2. `79a1a09`: `feat(actividades): agregar componentes Card, Filtros y Banner Destacado estilo Ticketek`
3. `1312516`: `feat(catalogo): implementar vistas de catalogo, favoritos, detalle y layout con filtros y busqueda`

---

## 🎯 ¿Qué queda pendiente para la próxima sesión?

Para completar el 100% del alcance de D2 y dejarlo listo para ensamblar con D3 y D4:

1. **Detalle completo de la actividad (`ActividadDetalleView.vue`)**:
   - Pulir la pantalla de detalle con ficha técnica completa: mapa/ubicación, cupos restantes en tiempo real, política de cancelación, organizador y galería de fotos.
   - Dejar listo el botón **"Reservar ahora"** con validación de cupo y evento para conectarlo con la lógica de reserva de D3 (Lauti).
2. **Página de Favoritos (`FavoritosView.vue`)**:
   - Agregar mensaje con llamado a la acción más vistoso y botón para vaciar favoritos.
3. **Tests Unitarios (Vitest)**:
   - Crear pruebas para la store `actividades.js` (filtrado por nombre, filtrado por categoría, alternar favoritos y persistencia). Esto cumple con el requisito de calidad del TP: *"Implementación de al menos un test unitario por cada lógica de negocio crítica"*.
4. **Pull Request**:
   - Crear el Pull Request en GitHub de `feature/catalogo-actividades` hacia `main` para que tus compañeros revisen e integren.
