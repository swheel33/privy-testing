import { create } from 'zustand'

interface SharedState {
    isConnected: boolean
    setIsConnected: (isConnected: boolean) => void
}

export const useStateStore = create<SharedState>((set) => ({
    isConnected: false,
    setIsConnected: (isConnected) => set({ isConnected }),
}))
