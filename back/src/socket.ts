import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

import {
  GamePhase,
  IGame,
  IJoinGame,
  ITurn,
} from '../../shared/interfaces/IGame';
import DB from './DB';
import { checkWhoseTurn } from './helpers';

const socketPort: number = Number(process.env.SOCKET_PORT) || 3000;

const app = express();
const socketServer = new http.Server(app);
const io = socketIo(socketServer);

io.on('connection', (socket: SocketIO.Socket) => {
  console.log('connection');

  socket.on('joinGame', ({ gameId: room, playerName }: IJoinGame) => {
    socket.join(room);
    console.log('socket joinGame');

    const db = new DB();
    const game = db.getGame(room);

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
          phase: GamePhase.FOUND_0,
          player0: playerName,
        };
        break;

      default:
        break;
    }

    const updatedGame = db.updateGame(game.id, updatedGameObj);
    io.in(room).emit('update', updatedGame);

    socket.on('turn', ({ type, position }: ITurn) => {
      console.log('turn');
      const whoseTurn = checkWhoseTurn(updatedGame.state);

      if (type === whoseTurn && updatedGame.state[position] === null) {
        const newState = [...updatedGame.state];
        newState[position] = type;

        const turnUpdatedGameObj = {
          ...updatedGame,
          state: newState,
        };
        const turnUpdatedGame: IGame = db.updateGame(game.id, turnUpdatedGameObj);

        io.in(room).emit('update', turnUpdatedGame);
      }
    });
  });
});

socketServer.listen(socketPort, () => {
  console.log(`listening on *:${socketPort}`);
});
