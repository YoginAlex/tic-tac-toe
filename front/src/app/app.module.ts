import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { ApiService } from './services/api.service';
import { LocalStorageService } from './services/local-storage.service';
import { SocketIoService } from './services/socket-io.service';
import { UserService } from './services/user.service';

import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';


@NgModule({
  declarations: [
    AppComponent,
    TicTacToeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    SocketIoService,
    UserService,
    LocalStorageService,
    ApiService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
