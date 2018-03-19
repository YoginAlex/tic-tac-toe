import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';


@Injectable()
export class SocketIoService {
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  open(): SocketIOClient.Socket {
    return this.socket.open();
  }
}
