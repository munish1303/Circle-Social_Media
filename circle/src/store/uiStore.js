import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toast: null,
  modal: null,
  bottomSheet: null,

  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), duration)
  },

  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),

  openBottomSheet: (sheet) => set({ bottomSheet: sheet }),
  closeBottomSheet: () => set({ bottomSheet: null }),
}))
