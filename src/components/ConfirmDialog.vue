<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')" role="alertdialog" aria-modal="true">
      <div class="dialog">
        <div class="dialog-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div class="dialog-content">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message" v-html="message"></p>
        </div>

        <div class="dialog-actions">
          <button class="cancel-btn" @click="$emit('cancel')">CANCELAR</button>
          <button class="confirm-btn" @click="$emit('confirm')">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ confirmLabel ?? 'CONFIRMAR' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmLabel?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 22, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.dialog {
  width: 100%;
  max-width: 380px;
  background: var(--bg-elevated);
  border: 1px solid rgba(214, 79, 67, 0.2);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px rgba(var(--ink), 0.16);
  animation: dialog-in 0.2s ease-out;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--danger-bg);
  border: 1px solid rgba(214, 79, 67, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--danger);
  margin-bottom: 1rem;
}

.dialog-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.dialog-message {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dialog-message :deep(strong) {
  color: var(--text-primary);
  font-weight: 500;
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (min-width: 640px) {
  .dialog-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.cancel-btn {
  width: 100%;
  padding: 0.62rem 1.1rem;
  background: transparent;
  border: 1px solid var(--border-mid);
  border-radius: 16px;
  color: var(--text-muted);
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.cancel-btn:hover {
  color: var(--text-secondary);
  border-color: var(--border-active);
}

.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.62rem 1.1rem;
  background: var(--danger-bg);
  border: 1px solid rgba(214, 79, 67, 0.25);
  border-radius: 16px;
  color: var(--danger);
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.confirm-btn:hover {
  background: rgba(214, 79, 67, 0.2);
  border-color: rgba(214, 79, 67, 0.4);
  box-shadow: 0 2px 12px rgba(214, 79, 67, 0.2);
}

@media (min-width: 640px) {
  .cancel-btn,
  .confirm-btn {
    width: auto;
  }
}
</style>
