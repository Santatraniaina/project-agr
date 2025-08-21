// src/components/WebSocketWrapper.jsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Modifié ici : ajout de "export default"
export default function WebSocketWrapper({ onNewClient }) {
  useEffect(() => {
    const socket = io('ws://localhost:3001', {
      transports: ['websocket']
    });

    socket.on('nouveau-client', (data) => {
      onNewClient(data);
    });

    return () => socket.disconnect();
  }, [onNewClient]);

  return null;
}