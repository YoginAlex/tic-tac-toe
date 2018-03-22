import * as express from 'express';
import * as http from 'http';
import { IGame } from '../../shared/interfaces/IGame';
import DB from './DB';

const apiPort: number = Number(process.env.PORT) || 80;

const httpServer = express();

httpServer.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Pass to next layer of middleware
  next();
});

httpServer.get('/', (req, res) => {
  const freeGame = new DB().getFreeGame();

  res.json(freeGame);
});

httpServer.listen(apiPort, () => {
  console.log(`listening on *:${apiPort}`);
});
