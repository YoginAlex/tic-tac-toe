import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../services/api.service';
import { SocketIoService } from '../../services/socket-io.service';
import { UserService } from '../../services/user.service';

import { IGame, IJoinGame, ITurn } from '../../../../../shared/interfaces/IGame';

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


    this.socket.on('update', (game: IGame) => {
      this.game = { ...game };
      console.log('on update this.game', this.game);
    });
  }

  getGame() {
    this.api.getGame().subscribe(data => {
      this.game = {...data};

      console.log('getGame this.game', this.game);

      this.user.setUserTypeByGame(this.game);
      if (!this.user.name) {
        this.user.setNameToDefault(this.game);
      }

      this.socket.emit('joinGame', <IJoinGame>{
        gameId: this.game.id,
        playerName: this.user.name,
      });
    });
  }

  onClick(number: number) {
    this.socket.emit('turn', { type: this.user.type, position: number });
  }
}
