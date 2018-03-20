import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../services/api.service';
import { SocketIoService } from '../../services/socket-io.service';
import { UserService } from '../../services/user.service';

import { IGame, IJoinGame, ITurn, PlayerType } from '../../../../../shared/interfaces/IGame';
import { SocketSignals } from '../../../../../shared/interfaces/SocketSignals';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.scss']
})
export class TicTacToeComponent implements OnInit {
  game: IGame;
  socket: SocketIOClient.Socket;

  constructor(
    private SocketIo: SocketIoService,
    private api: ApiService,
    public user: UserService,
  ) {
    this.socket = SocketIo.open();
  }

  ngOnInit() {
    this.getGame();

    this.socket.on(SocketSignals.UPDATE, (game: IGame) => {
      this.game = { ...game };
    });
  }

  getCellClass(i: number) {
    return {
      'noughts': this.game.state[i] === PlayerType.X,
      'crosses': this.game.state[i] === PlayerType.O,
    };
  }

  getGame() {
    this.api.getGame().subscribe(data => {
      this.game = {...data};

      console.log('this.game', this.game);
      this.user.setUserTypeByGame(this.game);

      if (!this.user.name) {
        this.user.setNameToDefault(this.game);
      }

      this.socket.emit(SocketSignals.JOIN_GAME, <IJoinGame>{
        gameId: this.game.id,
        playerName: this.user.name,
      });
    });
  }

  onClick(number: number) {
    this.socket.emit(SocketSignals.TURN, {
      type: this.user.type,
      position: number,
    });
  }
}
