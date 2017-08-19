const EventEmitter = require('events');
const icepick = require('icepick');

const {PARAMETERS, PUYOPUYO_COLOR_TYPES, PUYOPUYO_FIELD_SIZE} = require('./constants');


class Store {
  static _generatePuyopuyoFieldSquareMatrix(rowLength, columnLength) {
    const matrix = [];

    for (let rowIndex = 0; rowIndex < PUYOPUYO_FIELD_SIZE.rowLength; rowIndex += 1) {
      const line = [];
      matrix.push(line);

      for (let columnIndex = 0; columnIndex < PUYOPUYO_FIELD_SIZE.columnLength; columnIndex += 1) {
        line.push({
          rowIndex,
          columnIndex,
          colorType: PUYOPUYO_COLOR_TYPES.NONE,
        });
      }
    }

    return matrix;
  }

  constructor() {
    // It has a "change" event only.
    this._emitter = new EventEmitter();

    this._state = {
      puyopuyoFieldSquareMatrix: Store._generatePuyopuyoFieldSquareMatrix(
        PUYOPUYO_FIELD_SIZE.rowLength,
        PUYOPUYO_FIELD_SIZE.columnLength
      ),
      gameLoopId: 0,
      gameTime: 0,
    };

    this._gameLoopTimerId = null;

    // Tmp
    //setTimeout(() => {
    //  this._state.puyopuyoFieldSquareMatrix[0][0].colorType = 'RED';
    //  this._emitChange();
    //}, 1000);
  }

  get emitter() {
    return this._emitter;
  }

  _emitChange() {
    this._emitter.emit('change');
  }

  getState() {
    return this._state;
  }

  static _nextGameLoopState(state) {
    let newState = state;

    newState = icepick.assocIn(newState, ['gameLoopId'], newState.gameLoopId + 1);
    newState = icepick.assocIn(newState, ['gameTime'], newState.gameTime + PARAMETERS.GAME_LOOP_INTERVAL);

    return newState;
  }

  startGame() {
    const _handleGameLoop = () => {
      this._state = Store._nextGameLoopState(this._state);
      this._emitChange();
    };
    this._gameLoopTimerId = setInterval(_handleGameLoop, PARAMETERS.GAME_LOOP_INTERVAL);
  }
}

module.exports = Store;
