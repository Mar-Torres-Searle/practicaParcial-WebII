import { EventEmitter } from 'events';

const notificationService = new EventEmitter();

// Listeners
notificationService.on('user:registered', (data) => {
  console.log('Usuario registrado:', data.email);
});

notificationService.on('user:verified', (data) => {
  console.log('Usuario verificado:', data.email);
});

notificationService.on('user:invited', (data) => {
  console.log('Usuario invitado:', data.email);
});

notificationService.on('user:deleted', (data) => {
  console.log('Usuario eliminado:', data.email);
});

export default notificationService;