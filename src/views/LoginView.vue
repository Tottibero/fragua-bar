<template>
  <div class="login-page">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="embers" aria-hidden="true">
      <span v-for="n in 14" :key="n" class="ember" :style="getEmberStyle(n)"></span>
    </div>

    <div class="login-wrapper">
      <div class="login-card" :class="{ shake: isShaking }">
        <div class="brand">
          <img src="/logo.png" alt="Fragua47" class="brand-logo" />
          <div class="brand-text">
            <h1 class="brand-main">FRAGUA47</h1>
            <p class="brand-suffix">BAR</p>
          </div>
        </div>

        <div class="brand-divider"></div>

        <Transition name="alert">
          <div v-if="errorMsg" class="error-alert" role="alert">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errorMsg }}
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="field-group">
            <label class="field-label" for="identifier">CORREO O NICKNAME</label>
            <div class="field-wrap" :class="{ focused: focused === 'identifier' }">
              <svg class="fi" width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                autocomplete="username"
                placeholder="admin@fragua.es o nickname"
                required
                @focus="focused = 'identifier'"
                @blur="focused = null"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="password">CONTRASEÑA</label>
            <div class="field-wrap" :class="{ focused: focused === 'password' }">
              <svg class="fi" width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                id="password"
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                required
                @focus="focused = 'password'"
                @blur="focused = null"
              />
              <button
                type="button"
                class="eye-btn"
                @click="showPwd = !showPwd"
                :aria-label="showPwd ? 'Ocultar' : 'Mostrar'"
              >
                <svg v-if="!showPwd" width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <template v-if="!loading">
              ENTRAR
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
            <template v-else>
              <span class="spinner"></span>
              VERIFICANDO...
            </template>
          </button>
        </form>

        <p class="login-footer">Acceso restringido · Solo personal autorizado</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ identifier: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const focused = ref<string | null>(null)
const showPwd = ref(false)
const isShaking = ref(false)

function getEmberStyle(n: number) {
  return {
    left: `${(n * 7.1 + 3) % 100}%`,
    animationDelay: `${((n * 0.6) % 4).toFixed(1)}s`,
    animationDuration: `${3 + (n % 4)}s`,
    width: `${2 + (n % 3)}px`,
    height: `${2 + (n % 3)}px`,
    opacity: `${0.3 + (n % 3) * 0.2}`,
  }
}

async function handleLogin() {
  if (!form.value.identifier || !form.value.password) return

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await authService.login(form.value)
    auth.setAuth(res.token, res.user)
    router.push('/attendees')
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      errorMsg.value =
        err.response?.data?.message ?? 'Credenciales incorrectas. Inténtalo de nuevo.'
    } else {
      errorMsg.value = 'Error de conexión. Comprueba que el servidor está activo.'
    }
    isShaking.value = true
    setTimeout(() => (isShaking.value = false), 600)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #2d312f;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(240, 96, 32, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240, 96, 32, 0.04) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  bottom: -160px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 380px;
  background: radial-gradient(ellipse, rgba(240, 96, 32, 0.2) 0%, transparent 65%);
  pointer-events: none;
}

.embers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.ember {
  position: absolute;
  bottom: 8%;
  border-radius: 50%;
  background: #f06020;
  animation: ember-rise linear infinite;
  box-shadow: 0 0 5px #f06020;
}

@keyframes ember-rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  85% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-72vh) translateX(18px) scale(0.2);
    opacity: 0;
  }
}

.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
}

.login-card {
  background: #1e2422;
  border: 1px solid rgba(240, 96, 32, 0.2);
  border-radius: 3px;
  padding: 1.5rem;
  box-shadow:
    0 0 0 1px rgba(240, 96, 32, 0.05),
    0 25px 70px rgba(0, 0, 0, 0.5);
}

.login-card.shake {
  animation: card-shake 0.5s ease-in-out;
}

@keyframes card-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  18% {
    transform: translateX(-7px);
  }
  36% {
    transform: translateX(7px);
  }
  54% {
    transform: translateX(-4px);
  }
  72% {
    transform: translateX(4px);
  }
  90% {
    transform: translateX(-1px);
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.brand-logo {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  object-fit: contain;
  mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 45%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 45%, transparent 100%);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.brand-main {
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.9rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1;
  color: #c44a18;
  text-shadow: 0 0 16px rgba(196, 74, 24, 0.3);
}

.brand-suffix {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #ffffff;
  opacity: 0.9;
}

.brand-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(240, 96, 32, 0.35), transparent 70%);
  margin-bottom: 1.5rem;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  background: var(--danger-bg);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 2px;
  color: #fca5a5;
  font-size: 0.83rem;
  margin-bottom: 1.25rem;
}

.alert-enter-active,
.alert-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.9);
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field-wrap.focused {
  border-color: var(--border-active);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.fi {
  position: absolute;
  left: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.field-wrap input {
  flex: 1;
  padding: 0.9rem 0.85rem 0.9rem 2.65rem;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 1rem;
  font-family: 'JetBrains Mono', monospace;
}

.field-wrap input::placeholder {
  color: var(--text-muted);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.88rem;
}

.eye-btn {
  padding: 0.4rem 0.85rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.eye-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.submit-btn {
  margin-top: 0.35rem;
  padding: 1rem;
  min-height: 52px;
  background: linear-gradient(135deg, #c44a18 0%, #8c2e0c 100%);
  border: none;
  border-radius: 2px;
  color: #ffffff;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    box-shadow 0.2s,
    transform 0.1s,
    opacity 0.2s;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.06em;
}
</style>
