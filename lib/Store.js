const EventEmitter = require('events');

const {PUYOPUYO_COLOR_TYPES, PUYOPUYO_FIELD_SIZE} = require('./constants');


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
    };
  }

  get emitter() {
    return this._emitter;
  }

  getState() {
    return this._state;
  }
}

module.exports = Store;
