import { io } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export const socket = io(WS_URL + '/events', { autoConnect: false })

export function connectSocket(token: string) {
  socket.auth = { token }
  socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}
