# go-plan-pnt2

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Login de Go Plan

La pantalla `/login` (enlace **Mi cuenta**) permite ingresar con email y contraseña,
consultar la sesión al recargar y cerrarla. Usa los endpoints `/api/auth/login`,
`/api/auth/me` y `/api/auth/logout`. La cookie HttpOnly la administra el navegador;
no se guardan contraseñas ni tokens en localStorage.

Para probar con el backend desplegado:

1. Ejecutar `npm run dev` en esta carpeta y abrir la URL que informa Vite, seguida de `/login`.
2. Ingresar con una cuenta activa de la base del backend remoto.

Las solicitudes `/api` se envían mediante el proxy de Vite a
`https://goplan-tp2.onrender.com`. No hace falta ejecutar el backend local.
El proxy también está disponible con `npm run preview`.

La configuración opcional está en `.env.example`: copiar a `.env.local` para
cambiar `API_PROXY_TARGET` o `API_PROXY_ORIGIN`. Este último debe coincidir con
`APP_ORIGIN` del backend; el servidor remoto actualmente acepta `http://localhost:8080`.
Reiniciar Vite después de modificar estas variables.

La sesión se mantiene con la cookie HttpOnly a través del proxy. La conexión directa
desde el navegador al dominio remoto requiere configurar CORS y las cookies en el
backend. En producción, configurar un proxy inverso `/api` hacia Render en el hosting
del frontend; el build estático no incluye el proxy de Vite. El proxy de producción
debe enviar el Origin permitido por el backend, o adaptar APP_ORIGIN al origen real.

## Organización basada en las clases

Referencia: [EcoNatura, clase 10](https://github.com/anderson-ort/yatay_pnt_2b_2_cuatrimestre/tree/master/10_clase/ecoNaturaProject/src).

- `services/api.js`: cliente HTTP compartido (usa fetch nativo).
- `services/auth.js`: solicitudes de login, sesión y logout.
- `stores/authStore.js`: estado de usuario, getters y acciones con Pinia, usando Options Store como en clase.
- `composables/useAuth.js`: coordina el servicio y el store; expone loading y error.
- `views/AccesoView.vue`: página compartida con panel de presentación, contenedor y pie. Su RouterView muestra el formulario de la ruta hija.
- `components/auth/LoginForm.vue` y `RegistroForm.vue`: formularios con reactive, v-model y @submit.prevent.
- `components/auth/PasswordField.vue` y `GoogleButton.vue`: controles reutilizables.
- `assets/auth.css`: estilos compartidos, limitados a la página de acceso.

Las rutas /login y /registro usan la misma página; /acceso redirige al login.

El ejemplo de clase usa Axios y Supabase con tokens. Go Plan conserva fetch y su
API propia con cookie HttpOnly; no necesita claves de Supabase, refresh tokens ni
persistir tokens en sessionStorage. Al recargar, recupera el usuario desde `/api/auth/me`.


## Acceso con Google

El botón de `/login` y `/registro` carga Google Identity Services y muestra el botón oficial para elegir cuenta. Usa `GET /api/auth/google/config` (Client ID y nonce) y `POST /api/auth/google` (credential y, si responde 422, nombre y apellido). Actualiza el mismo store y la cookie HttpOnly que el login por credenciales. La credencial permanece en memoria y se descarta al salir del formulario o cancelar. Incluye errores y reintento; un email existente sin vincular muestra el conflicto del backend.

Configurar `GOOGLE_CLIENT_ID` en el backend que recibe el proxy. En Google Cloud, autorizar el origen exacto del navegador (por ejemplo `http://localhost:5173`; agregar el puerto de preview si se usa). No se necesita Client Secret ni configurar un ID en Vue. El backend remoto debe tener desplegados los endpoints de Google.

Para usar el backend local, crear `.env.local` con:

```env
API_PROXY_TARGET=http://localhost:8080
API_PROXY_ORIGIN=http://localhost:8080
```

Reiniciar Vite. En producción, conservar el proxy `/api` y configurar `Referrer-Policy: no-referrer-when-downgrade` para pruebas HTTP en localhost (Vite ya la envía). La configuración OAuth y el acceso real se verifican con una cuenta de Google en el navegador.
