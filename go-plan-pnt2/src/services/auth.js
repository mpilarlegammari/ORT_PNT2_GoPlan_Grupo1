import api from './api.js'

export function signIn(email, password) {
  return api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  })
}

export function getSession() {
  return api('/auth/me')
}

export function signOut() {
  return api('/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
}

export function getGoogleConfig() {
  return api('/auth/google/config')
}

export function signInGoogle(datos) {
  return api('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
}
