/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../shared/interfaces/IGame.ts":
/*!*************************************!*\
  !*** ../shared/interfaces/IGame.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PlayerType;
(function (PlayerType) {
    PlayerType["X"] = "x";
    PlayerType["O"] = "o";
})(PlayerType = exports.PlayerType || (exports.PlayerType = {}));
var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["NEW"] = 0] = "NEW";
    GamePhase[GamePhase["FOUND_X"] = 1] = "FOUND_X";
    GamePhase[GamePhase["FOUND_0"] = 2] = "FOUND_0";
    GamePhase[GamePhase["STARTED"] = 3] = "STARTED";
    GamePhase[GamePhase["FINISHED"] = 4] = "FINISHED";
})(GamePhase = exports.GamePhase || (exports.GamePhase = {}));


/***/ }),

/***/ "../shared/interfaces/SocketSignals.ts":
/*!*********************************************!*\
  !*** ../shared/interfaces/SocketSignals.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SocketSignals;
(function (SocketSignals) {
    SocketSignals["JOIN_GAME"] = "joinGame";
    SocketSignals["TURN"] = "turn";
    SocketSignals["UPDATE"] = "update";
})(SocketSignals = exports.SocketSignals || (exports.SocketSignals = {}));


/***/ }),

/***/ "./src/DB.ts":
/*!*******************!*\
  !*** ./src/DB.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Lowdb = __webpack_require__(/*! lowdb */ "lowdb");
const FileSync = __webpack_require__(/*! lowdb/adapters/FileSync */ "lowdb/adapters/FileSync");
const Uuid = __webpack_require__(/*! uuid */ "uuid");
const IGame_1 = __webpack_require__(/*! ../../shared/interfaces/IGame */ "../shared/interfaces/IGame.ts");
const GAME_START_DIFF = 10 * 60 * 1000;
const defaultState = {
    games: [],
};
class DB {
    constructor() {
        const adapter = new FileSync('db.json', {
            defaultValue: defaultState,
        });
        this.db = Lowdb(adapter);
    }
    getState() {
        return this.db.getState();
    }
    getGame(id) {
        return this.getGames()
            .find(({ id: gameId }) => gameId === id)
            .value();
    }
    getFreeGame() {
        this.cleanOldGames();
        const freeGame = this.getGames()
            .find(({ phase }) => phase === IGame_1.GamePhase.NEW || phase === IGame_1.GamePhase.FOUND_X)
            .value();
        return freeGame ? freeGame : this.createNewGame();
    }
    reload() {
        this.db.read();
    }
    updateGame(id, obj) {
        return this.getGames()
            .find(({ id: gameId }) => gameId === id)
            .assign(obj)
            .write();
    }
    createNewGame() {
        const newId = Uuid.v4();
        const newGame = this.getGames()
            .push({
            id: newId,
            phase: IGame_1.GamePhase.NEW,
            start: new Date(),
            state: new Array(9).fill(null),
        })
            .write()
            .find(({ id }) => id === newId);
        return newGame;
    }
    cleanOldGames() {
        this.getGames()
            .remove(({ start }) => new Date().getTime() - new Date(start).getTime() >= GAME_START_DIFF)
            .write();
    }
    getDb() {
        return this.db;
    }
    getGames() {
        return this.getDb().get('games');
    }
    getAllGames() {
        return this.getGames().value();
    }
}
exports.default = DB;


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IGame_1 = __webpack_require__(/*! ../../shared/interfaces/IGame */ "../shared/interfaces/IGame.ts");
const checkNull = (s) => s === null;
function checkEmptyGame(state) {
    return state.filter(checkNull).length === state.length;
}
exports.checkEmptyGame = checkEmptyGame;
function checkWhoseTurn(state) {
    if (state.filter(checkNull).length === state.length) {
        return IGame_1.PlayerType.X;
    }
    const checkX = (s) => s === IGame_1.PlayerType.X;
    const check0 = (s) => s === IGame_1.PlayerType.O;
    const lenghtX = state.filter(checkX).length;
    const lenght0 = state.filter(check0).length;
    return lenghtX > lenght0
        ? IGame_1.PlayerType.O
        : IGame_1.PlayerType.X;
}
exports.checkWhoseTurn = checkWhoseTurn;


/***/ }),

/***/ "./src/http.ts":
/*!*********************!*\
  !*** ./src/http.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(/*! express */ "express");
const DB_1 = __webpack_require__(/*! ./DB */ "./src/DB.ts");
const apiPort = Number(process.env.PORT) || 8090;
const httpServer = express();
httpServer.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});
httpServer.get('/', (req, res) => {
    const freeGame = new DB_1.default().getFreeGame();
    res.json(freeGame);
});
httpServer.listen(apiPort, () => {
    console.log(`listening on *:${apiPort}`);
});


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(/*! ./DB */ "./src/DB.ts");
__webpack_require__(/*! ./http */ "./src/http.ts");
__webpack_require__(/*! ./socket */ "./src/socket.ts");


/***/ }),

/***/ "./src/socket.ts":
/*!***********************!*\
  !*** ./src/socket.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(/*! express */ "express");
const http = __webpack_require__(/*! http */ "http");
const socketIo = __webpack_require__(/*! socket.io */ "socket.io");
const IGame_1 = __webpack_require__(/*! ../../shared/interfaces/IGame */ "../shared/interfaces/IGame.ts");
const SocketSignals_1 = __webpack_require__(/*! ../../shared/interfaces/SocketSignals */ "../shared/interfaces/SocketSignals.ts");
const DB_1 = __webpack_require__(/*! ./DB */ "./src/DB.ts");
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
const socketPort = Number(process.env.SOCKET_PORT) || 3000;
const app = express();
const socketServer = new http.Server(app);
const io = socketIo(socketServer);
io.on('connection', (socket) => {
    console.log('connection');
    socket.on(SocketSignals_1.SocketSignals.JOIN_GAME, ({ gameId: room, playerName }) => {
        socket.join(room);
        console.log('socket joinGame');
        const db = new DB_1.default();
        let game = db.getGame(room);
        const emptyRoom = io.sockets.adapter.rooms[room].length < 2;
        console.log('io.sockets.adapter.rooms[room].length', io.sockets.adapter.rooms[room].length);
        let updatedGameObj = Object.assign({}, game);
        switch (game.phase) {
            case IGame_1.GamePhase.NEW:
                updatedGameObj = Object.assign({}, updatedGameObj, { phase: IGame_1.GamePhase.FOUND_X, playerX: playerName });
                break;
            case IGame_1.GamePhase.FOUND_X:
                updatedGameObj = Object.assign({}, updatedGameObj, { phase: emptyRoom ? IGame_1.GamePhase.FOUND_X : IGame_1.GamePhase.FOUND_0, [emptyRoom ? 'playerX' : 'player0']: playerName });
                break;
            default:
                break;
        }
        io.in(room).emit(SocketSignals_1.SocketSignals.UPDATE, db.updateGame(game.id, updatedGameObj));
        socket.on(SocketSignals_1.SocketSignals.TURN, ({ type, position }) => {
            db.reload();
            game = db.getGame(room);
            const whoseTurn = helpers_1.checkWhoseTurn(game.state);
            if (type === whoseTurn && game.state[position] === null) {
                const newState = [...game.state];
                newState[position] = type;
                const turnUpdatedGameObj = Object.assign({}, game, { phase: IGame_1.GamePhase.STARTED, state: newState });
                io.in(room).emit(SocketSignals_1.SocketSignals.UPDATE, db.updateGame(game.id, turnUpdatedGameObj));
            }
        });
    });
});
socketServer.listen(socketPort, () => {
    console.log(`listening on *:${socketPort}`);
});


/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "lowdb":
/*!************************!*\
  !*** external "lowdb" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lowdb");

/***/ }),

/***/ "lowdb/adapters/FileSync":
/*!******************************************!*\
  !*** external "lowdb/adapters/FileSync" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lowdb/adapters/FileSync");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC9pbnRlcmZhY2VzL0lHYW1lLnRzIiwid2VicGFjazovLy8uLi9zaGFyZWQvaW50ZXJmYWNlcy9Tb2NrZXRTaWduYWxzLnRzIiwid2VicGFjazovLy8uL3NyYy9EQi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaGVscGVycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaHR0cC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NvY2tldC50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiaHR0cFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImxvd2RiXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibG93ZGIvYWRhcHRlcnMvRmlsZVN5bmNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzb2NrZXQuaW9cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7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QUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNuRkgsb0M7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsb0Q7Ozs7Ozs7Ozs7O0FDQUEsc0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIHdhc20gbW9kdWxlc1xuIFx0dmFyIGluc3RhbGxlZFdhc21Nb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgY29tcGlsZWQgV2ViQXNzZW1ibHkuTW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiZXhwb3J0IGVudW0gUGxheWVyVHlwZSB7XG4gIFggPSAneCcsXG4gIE8gPSAnbycsXG59XG5cbmV4cG9ydCBlbnVtIEdhbWVQaGFzZSB7XG4gIE5FVyxcbiAgRk9VTkRfWCxcbiAgRk9VTkRfMCxcbiAgU1RBUlRFRCxcbiAgRklOSVNIRUQsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUpvaW5HYW1lIHtcbiAgZ2FtZUlkOiBzdHJpbmc7XG4gIHBsYXllck5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHVybiB7XG4gIHR5cGU6IFBsYXllclR5cGU7XG4gIHBvc2l0aW9uOiAwfDF8MnwzfDR8NXw2fDd8ODtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJR2FtZSB7XG4gIGlkOiBzdHJpbmc7XG4gIHBsYXllclg/OiBzdHJpbmc7XG4gIHBsYXllcjA/OiBzdHJpbmc7XG4gIHN0YXJ0PzogRGF0ZTtcbiAgc3RhdGU6IGFueVtdO1xuICBwaGFzZTogR2FtZVBoYXNlO1xufVxuIiwiZXhwb3J0IGVudW0gU29ja2V0U2lnbmFscyB7XG4gICAgSk9JTl9HQU1FID0gJ2pvaW5HYW1lJyxcbiAgICBUVVJOID0gJ3R1cm4nLFxuICAgIFVQREFURSA9ICd1cGRhdGUnLFxufSIsIi8qIHRzbGludDpkaXNhYmxlIHByZWZlci1hcnJheS1saXRlcmFsICovXG5pbXBvcnQgKiBhcyBMb3dkYiBmcm9tICdsb3dkYic7XG5pbXBvcnQgKiBhcyBGaWxlU3luYyBmcm9tICdsb3dkYi9hZGFwdGVycy9GaWxlU3luYyc7XG5pbXBvcnQgKiBhcyBVdWlkIGZyb20gJ3V1aWQnO1xuXG5pbXBvcnQgeyBJRGJTY2hlbWEgfSBmcm9tICcuLi8uLi9zaGFyZWQvaW50ZXJmYWNlcy9JRGJTY2hlbWEnO1xuaW1wb3J0IHsgR2FtZVBoYXNlLCBJR2FtZSB9IGZyb20gJy4uLy4uL3NoYXJlZC9pbnRlcmZhY2VzL0lHYW1lJztcbmltcG9ydCB7IGNoZWNrRW1wdHlHYW1lIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuY29uc3QgR0FNRV9TVEFSVF9ESUZGID0gMTAgKiA2MCAqIDEwMDA7IC8vIDEwIG1pbnV0ZXNcblxuY29uc3QgZGVmYXVsdFN0YXRlOiBJRGJTY2hlbWEgPSB7XG4gIGdhbWVzOiBbXSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERCIHtcbiAgcHJpdmF0ZSBkYjogTG93ZGIuTG93ZGI8SURiU2NoZW1hLCBMb3dkYi5BZGFwdGVyU3luYzxJRGJTY2hlbWE+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBhZGFwdGVyOiBMb3dkYi5BZGFwdGVyU3luYzxJRGJTY2hlbWE+ID0gbmV3IEZpbGVTeW5jKCdkYi5qc29uJywge1xuICAgICAgZGVmYXVsdFZhbHVlOiBkZWZhdWx0U3RhdGUsXG4gICAgfSk7XG5cbiAgICB0aGlzLmRiID0gTG93ZGI8SURiU2NoZW1hLCB0eXBlb2YgYWRhcHRlcj4oYWRhcHRlcik7XG4gIH1cblxuICBwdWJsaWMgZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGIuZ2V0U3RhdGUoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRHYW1lKGlkOiBzdHJpbmcpOiBJR2FtZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldEdhbWVzKClcbiAgICAgIC5maW5kKCh7IGlkOiBnYW1lSWQgfSkgPT4gZ2FtZUlkID09PSBpZClcbiAgICAgIC52YWx1ZSgpO1xuICB9XG5cbiAgcHVibGljIGdldEZyZWVHYW1lKCk6IElHYW1lIHtcbiAgICB0aGlzLmNsZWFuT2xkR2FtZXMoKTtcblxuICAgIGNvbnN0IGZyZWVHYW1lID0gdGhpcy5nZXRHYW1lcygpXG4gICAgICAuZmluZCgoeyBwaGFzZSB9KSA9PiBwaGFzZSA9PT0gR2FtZVBoYXNlLk5FVyB8fCBwaGFzZSA9PT0gR2FtZVBoYXNlLkZPVU5EX1gpXG4gICAgICAudmFsdWUoKTtcblxuICAgIHJldHVybiBmcmVlR2FtZSA/IGZyZWVHYW1lIDogdGhpcy5jcmVhdGVOZXdHYW1lKCk7XG4gIH1cblxuICBwdWJsaWMgcmVsb2FkKCkge1xuICAgIHRoaXMuZGIucmVhZCgpO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZUdhbWUoaWQ6IHN0cmluZywgb2JqOiBJR2FtZSk6IElHYW1lIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHYW1lcygpXG4gICAgICAuZmluZCgoeyBpZDogZ2FtZUlkIH0pID0+IGdhbWVJZCA9PT0gaWQpXG4gICAgICAuYXNzaWduKG9iailcbiAgICAgIC53cml0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVOZXdHYW1lKCk6IElHYW1lIHtcbiAgICBjb25zdCBuZXdJZDogc3RyaW5nID0gVXVpZC52NCgpO1xuXG4gICAgY29uc3QgbmV3R2FtZSA9IHRoaXMuZ2V0R2FtZXMoKVxuICAgICAgLnB1c2goe1xuICAgICAgICBpZDogbmV3SWQsXG4gICAgICAgIHBoYXNlOiBHYW1lUGhhc2UuTkVXLFxuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcbiAgICAgICAgc3RhdGU6IG5ldyBBcnJheSg5KS5maWxsKG51bGwpLFxuICAgICAgfSlcbiAgICAgIC53cml0ZSgpXG4gICAgICAuZmluZCgoeyBpZCB9KSA9PiBpZCA9PT0gbmV3SWQpO1xuXG4gICAgcmV0dXJuIG5ld0dhbWU7XG4gIH1cblxuICBwcml2YXRlIGNsZWFuT2xkR2FtZXMoKSB7XG4gICAgdGhpcy5nZXRHYW1lcygpXG4gICAgICAucmVtb3ZlKCh7IHN0YXJ0IH0pID0+IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbmV3IERhdGUoc3RhcnQpLmdldFRpbWUoKSA+PSBHQU1FX1NUQVJUX0RJRkYpXG4gICAgICAud3JpdGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGIoKTogTG93ZGIuTG93ZGI8SURiU2NoZW1hLCBMb3dkYi5BZGFwdGVyU3luYzxJRGJTY2hlbWE+PiB7XG4gICAgcmV0dXJuIHRoaXMuZGI7XG4gIH1cblxuICBwcml2YXRlIGdldEdhbWVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldERiKCkuZ2V0KCdnYW1lcycpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBbGxHYW1lcygpOiBJR2FtZVtdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHYW1lcygpLnZhbHVlKCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBsYXllclR5cGUgfSBmcm9tICcuLi8uLi9zaGFyZWQvaW50ZXJmYWNlcy9JR2FtZSc7XG5cbmNvbnN0IGNoZWNrTnVsbCA9IChzOiBhbnkpID0+IHMgPT09IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0VtcHR5R2FtZShzdGF0ZTogYW55W10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHN0YXRlLmZpbHRlcihjaGVja051bGwpLmxlbmd0aCA9PT0gc3RhdGUubGVuZ3RoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tXaG9zZVR1cm4oc3RhdGU6IGFueVtdKTogUGxheWVyVHlwZSAge1xuXG4gIGlmIChzdGF0ZS5maWx0ZXIoY2hlY2tOdWxsKS5sZW5ndGggPT09IHN0YXRlLmxlbmd0aCkge1xuICAgIHJldHVybiBQbGF5ZXJUeXBlLlg7XG4gIH1cblxuICBjb25zdCBjaGVja1ggPSAoczogYW55KSA9PiBzID09PSBQbGF5ZXJUeXBlLlg7XG4gIGNvbnN0IGNoZWNrMCA9IChzOiBhbnkpID0+IHMgPT09IFBsYXllclR5cGUuTztcblxuICBjb25zdCBsZW5naHRYID0gc3RhdGUuZmlsdGVyKGNoZWNrWCkubGVuZ3RoO1xuICBjb25zdCBsZW5naHQwID0gc3RhdGUuZmlsdGVyKGNoZWNrMCkubGVuZ3RoO1xuXG4gIHJldHVybiBsZW5naHRYID4gbGVuZ2h0MFxuICAgID8gUGxheWVyVHlwZS5PXG4gICAgOiBQbGF5ZXJUeXBlLlg7XG59XG4iLCJpbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB7IElHYW1lIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2ludGVyZmFjZXMvSUdhbWUnO1xuaW1wb3J0IERCIGZyb20gJy4vREInO1xuXG5jb25zdCBhcGlQb3J0OiBudW1iZXIgPSBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCkgfHwgODA5MDtcblxuY29uc3QgaHR0cFNlcnZlciA9IGV4cHJlc3MoKTtcblxuaHR0cFNlcnZlci51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gIC8vIFdlYnNpdGUgeW91IHdpc2ggdG8gYWxsb3cgdG8gY29ubmVjdFxuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnaHR0cDovL2xvY2FsaG9zdDo0MjAwJyk7XG4gIC8vIFJlcXVlc3QgbWV0aG9kcyB5b3Ugd2lzaCB0byBhbGxvd1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgT1BUSU9OUywgUFVULCBQQVRDSCwgREVMRVRFJyk7XG4gIC8vIFJlcXVlc3QgaGVhZGVycyB5b3Ugd2lzaCB0byBhbGxvd1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ1gtUmVxdWVzdGVkLVdpdGgsY29udGVudC10eXBlJyk7XG4gIC8vIFNldCB0byB0cnVlIGlmIHlvdSBuZWVkIHRoZSB3ZWJzaXRlIHRvIGluY2x1ZGUgY29va2llcyBpbiB0aGUgcmVxdWVzdHMgc2VudFxuICAvLyB0byB0aGUgQVBJIChlLmcuIGluIGNhc2UgeW91IHVzZSBzZXNzaW9ucylcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAvLyBQYXNzIHRvIG5leHQgbGF5ZXIgb2YgbWlkZGxld2FyZVxuICBuZXh0KCk7XG59KTtcblxuaHR0cFNlcnZlci5nZXQoJy8nLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZnJlZUdhbWUgPSBuZXcgREIoKS5nZXRGcmVlR2FtZSgpO1xuXG4gIHJlcy5qc29uKGZyZWVHYW1lKTtcbn0pO1xuXG5odHRwU2VydmVyLmxpc3RlbihhcGlQb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBsaXN0ZW5pbmcgb24gKjoke2FwaVBvcnR9YCk7XG59KTtcbiIsImltcG9ydCAnLi9EQic7XG5pbXBvcnQgJy4vaHR0cCc7XG5pbXBvcnQgJy4vc29ja2V0JztcbiIsImltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgc29ja2V0SW8gZnJvbSAnc29ja2V0LmlvJztcblxuaW1wb3J0IHtcbiAgR2FtZVBoYXNlLFxuICBJR2FtZSxcbiAgSUpvaW5HYW1lLFxuICBJVHVybixcbn0gZnJvbSAnLi4vLi4vc2hhcmVkL2ludGVyZmFjZXMvSUdhbWUnO1xuaW1wb3J0IHsgU29ja2V0U2lnbmFscyB9IGZyb20gJy4uLy4uL3NoYXJlZC9pbnRlcmZhY2VzL1NvY2tldFNpZ25hbHMnO1xuaW1wb3J0IERCIGZyb20gJy4vREInO1xuaW1wb3J0IHsgY2hlY2tXaG9zZVR1cm4gfSBmcm9tICcuL2hlbHBlcnMnO1xuXG5jb25zdCBzb2NrZXRQb3J0OiBudW1iZXIgPSBOdW1iZXIocHJvY2Vzcy5lbnYuU09DS0VUX1BPUlQpIHx8IDMwMDA7XG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbmNvbnN0IHNvY2tldFNlcnZlciA9IG5ldyBodHRwLlNlcnZlcihhcHApO1xuY29uc3QgaW8gPSBzb2NrZXRJbyhzb2NrZXRTZXJ2ZXIpO1xuXG5pby5vbignY29ubmVjdGlvbicsIChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCkgPT4ge1xuICBjb25zb2xlLmxvZygnY29ubmVjdGlvbicpO1xuXG4gIHNvY2tldC5vbihTb2NrZXRTaWduYWxzLkpPSU5fR0FNRSwgKHsgZ2FtZUlkOiByb29tLCBwbGF5ZXJOYW1lIH06IElKb2luR2FtZSkgPT4ge1xuICAgIHNvY2tldC5qb2luKHJvb20pO1xuICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgam9pbkdhbWUnKTtcblxuICAgIGNvbnN0IGRiID0gbmV3IERCKCk7XG4gICAgbGV0IGdhbWUgPSBkYi5nZXRHYW1lKHJvb20pO1xuICAgIGNvbnN0IGVtcHR5Um9vbSA9IGlvLnNvY2tldHMuYWRhcHRlci5yb29tc1tyb29tXS5sZW5ndGggPCAyO1xuICAgIGNvbnNvbGUubG9nKCdpby5zb2NrZXRzLmFkYXB0ZXIucm9vbXNbcm9vbV0ubGVuZ3RoJywgaW8uc29ja2V0cy5hZGFwdGVyLnJvb21zW3Jvb21dLmxlbmd0aCk7XG5cbiAgICBsZXQgdXBkYXRlZEdhbWVPYmo6IElHYW1lID0ge1xuICAgICAgLi4uZ2FtZSxcbiAgICB9O1xuXG4gICAgc3dpdGNoIChnYW1lLnBoYXNlKSB7XG4gICAgICBjYXNlIEdhbWVQaGFzZS5ORVc6XG4gICAgICAgIHVwZGF0ZWRHYW1lT2JqID0ge1xuICAgICAgICAgIC4uLnVwZGF0ZWRHYW1lT2JqLFxuICAgICAgICAgIHBoYXNlOiBHYW1lUGhhc2UuRk9VTkRfWCxcbiAgICAgICAgICBwbGF5ZXJYOiBwbGF5ZXJOYW1lLFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBHYW1lUGhhc2UuRk9VTkRfWDpcbiAgICAgICAgdXBkYXRlZEdhbWVPYmogPSB7XG4gICAgICAgICAgLi4udXBkYXRlZEdhbWVPYmosXG4gICAgICAgICAgcGhhc2U6IGVtcHR5Um9vbSA/IEdhbWVQaGFzZS5GT1VORF9YIDogR2FtZVBoYXNlLkZPVU5EXzAsXG4gICAgICAgICAgW2VtcHR5Um9vbSA/ICdwbGF5ZXJYJyA6ICdwbGF5ZXIwJ106IHBsYXllck5hbWUsXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpby5pbihyb29tKS5lbWl0KFNvY2tldFNpZ25hbHMuVVBEQVRFLCBkYi51cGRhdGVHYW1lKGdhbWUuaWQsIHVwZGF0ZWRHYW1lT2JqKSk7XG5cbiAgICBzb2NrZXQub24oU29ja2V0U2lnbmFscy5UVVJOLCAoeyB0eXBlLCBwb3NpdGlvbiB9OiBJVHVybikgPT4ge1xuICAgICAgZGIucmVsb2FkKCk7XG4gICAgICBnYW1lID0gZGIuZ2V0R2FtZShyb29tKTtcblxuICAgICAgY29uc3Qgd2hvc2VUdXJuID0gY2hlY2tXaG9zZVR1cm4oZ2FtZS5zdGF0ZSk7XG5cbiAgICAgIGlmICh0eXBlID09PSB3aG9zZVR1cm4gJiYgZ2FtZS5zdGF0ZVtwb3NpdGlvbl0gPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBbLi4uZ2FtZS5zdGF0ZV07XG4gICAgICAgIG5ld1N0YXRlW3Bvc2l0aW9uXSA9IHR5cGU7XG5cbiAgICAgICAgY29uc3QgdHVyblVwZGF0ZWRHYW1lT2JqOiBJR2FtZSA9IHtcbiAgICAgICAgICAuLi5nYW1lLFxuICAgICAgICAgIHBoYXNlOiBHYW1lUGhhc2UuU1RBUlRFRCxcbiAgICAgICAgICBzdGF0ZTogbmV3U3RhdGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgaW8uaW4ocm9vbSkuZW1pdChTb2NrZXRTaWduYWxzLlVQREFURSwgZGIudXBkYXRlR2FtZShnYW1lLmlkLCB0dXJuVXBkYXRlZEdhbWVPYmopKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcblxuc29ja2V0U2VydmVyLmxpc3Rlbihzb2NrZXRQb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBsaXN0ZW5pbmcgb24gKjoke3NvY2tldFBvcnR9YCk7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaHR0cFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb3dkYlwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb3dkYi9hZGFwdGVycy9GaWxlU3luY1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzb2NrZXQuaW9cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9