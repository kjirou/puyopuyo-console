const EventEmitter = require('events');
const icepick = require('icepick');

const {
  PAD_OPERATIONS,
  PARAMETERS,
} = require('./constants');
const stateUtils = require('./state-utils');


class Store {
  constructor() {
    // It has a "change" event only.
    this._emitter = new EventEmitter();

    this._state = stateUtils.createInitialState();

    this._gameLoopTimerId = null;
  }

  getEmitter() {
    return this._emitter;
  }

  getState() {
    return this._state;
  }

  _emitChange() {
    this._emitter.emit('change');
  }

  startGame() {
    const handleGameLoop = () => {
      this._state = stateUtils.calculateNextGameLoopState(this._state);
      this._emitChange();
    };
    this._gameLoopTimerId = setInterval(handleGameLoop, PARAMETERS.GAME_LOOP_INTERVAL);
  }

  receivePadOperation(padOperation) {
    if (this._state.padOperation === PAD_OPERATIONS.NONE) {
      this._state = icepick.assocIn(this._state, ['padOperation'], padOperation);
    }
  }
}

module.exports = Store;
