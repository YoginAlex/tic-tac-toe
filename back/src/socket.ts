import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

import {
  GamePhase,
  IGame,
  IJoinGame,
  ITurn,
} from '../../shared/interfaces/IGame';
import { SocketSignals } from '../../shared/interfaces/SocketSignals';
import DB from './DB';
import { checkWhoseTurn } from './helpers';

const socketPort: number = Number(process.env.SOCKET_PORT) || 3000;

const app = express();
const socketServer = new http.Server(app);
const io = socketIo(socketServer);

io.on('connection', (socket: SocketIO.Socket) => {
  console.log('connection');

  socket.on(SocketSignals.JOIN_GAME, ({ gameId: room, playerName }: IJoinGame) => {
    socket.join(room);
    console.log('socket joinGame');

    const db = new DB();
    let game = db.getGame(room);
    const emptyRoom = io.sockets.adapter.rooms[room].length < 2;
    console.log('io.sockets.adapter.rooms[room].length', io.sockets.adapter.rooms[room].length);

    let updatedGameObj: IGame = {
      ...game,
    };

    switch (game.phase) {
      case GamePhase.NEW:
        updatedGameObj = {
          ...updatedGameObj,
          phase: GamePhase.FOUND_X,
          playerX: playerName,
        };
        break;

      case GamePhase.FOUND_X:
        updatedGameObj = {
          ...updatedGameObj,
          phase: emptyRoom ? GamePhase.FOUND_X : GamePhase.FOUND_0,
          [emptyRoom ? 'playerX' : 'player0']: playerName,
        };
        break;

      default:
        break;
    }

    io.in(room).emit(SocketSignals.UPDATE, db.updateGame(game.id, updatedGameObj));

    socket.on(SocketSignals.TURN, ({ type, position }: ITurn) => {
      db.reload();
      game = db.getGame(room);

      const whoseTurn = checkWhoseTurn(game.state);

      if (type === whoseTurn && game.state[position] === null) {
        const newState = [...game.state];
        newState[position] = type;

        const turnUpdatedGameObj: IGame = {
          ...game,
          phase: GamePhase.STARTED,
          state: newState,
        };

        io.in(room).emit(SocketSignals.UPDATE, db.updateGame(game.id, turnUpdatedGameObj));
      }
    });
  });
});

socketServer.listen(socketPort, () => {
  console.log(`listening on *:${socketPort}`);
});
