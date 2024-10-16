import { io } from 'socket.io-client';
import { HOST } from './utils';

export const socket = io(HOST, {
    autoConnect: false,
    secure: true,
    withCredentials: true
})