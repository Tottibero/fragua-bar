<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          role="alert"
        >
          <div class="toast-icon">
            <!-- success -->
            <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- error -->
            <svg v-else-if="toast.type === 'error'" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- info -->
            <svg v-else width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <span class="toast-msg">{{ toast.message }}</span>

          <button class="toast-close" @click="toastStore.dismiss(toast.id)" aria-label="Cerrar">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <div class="toast-bar"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 1rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
}

@media (min-width: 640px) {
  .toast-stack {
    bottom: 1.5rem;
    left: auto;
    right: 1.5rem;
  }
}

.toast {
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  background: var(--bg-elevated);
  border: 1px solid transparent;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

@media (min-width: 640px) {
  .toast {
    min-width: 280px;
    max-width: 380px;
  }
}

.toast-success {
  border-color: rgba(95, 197, 147, 0.25);
  box-shadow:
    0 0 0 1px rgba(95, 197, 147, 0.06),
    0 8px 30px rgba(0, 0, 0, 0.4);
}

.toast-error {
  border-color: rgba(242, 131, 122, 0.25);
  box-shadow:
    0 0 0 1px rgba(242, 131, 122, 0.06),
    0 8px 30px rgba(0, 0, 0, 0.4);
}

.toast-info {
  border-color: var(--border-active);
  box-shadow:
    0 0 0 1px var(--accent-glow),
    0 8px 30px rgba(0, 0, 0, 0.4);
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon {
  background: var(--success-bg);
  color: var(--success);
}

.toast-error .toast-icon {
  background: var(--danger-bg);
  color: var(--danger);
}

.toast-info .toast-icon {
  background: var(--accent-glow);
  color: var(--accent);
}

.toast-msg {
  flex: 1;
  font-size: 0.84rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  padding: 0.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  border-radius: 2px;
  transition: color 0.2s;
}

.toast-close:hover {
  color: var(--text-secondary);
}

.toast-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  transform-origin: left;
  animation: bar-shrink 4.5s linear forwards;
}

.toast-success .toast-bar {
  background: var(--success);
}

.toast-error .toast-bar {
  background: var(--danger);
}

.toast-info .toast-bar {
  background: var(--accent);
}

@keyframes bar-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions */
.toast-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.toast-move {
  transition: transform 0.2s ease;
}
</style>
