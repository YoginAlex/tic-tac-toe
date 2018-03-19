import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { IGame } from '../../../../shared/interfaces/IGame';
import { Observable } from 'rxjs/Observable';

const GET_GAME_URL = 'http://localhost:8090/';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) { }

  getGame(): Observable<IGame> {
    return this.http.get<IGame>(GET_GAME_URL);
  }
}
