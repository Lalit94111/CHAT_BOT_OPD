import io from 'socket.io-client'

const Backend_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const socket = io(Backend_URL)

export default socket

