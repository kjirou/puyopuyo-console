const EventEmitter = require('events');
const icepick = require('icepick');

const {PARAMETERS, PUYOPUYO_COLOR_TYPES, PUYOPUYO_FIELD_SIZE} = require('./constants');


const DIRECTIONS = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};
const DIRECTIONS_TO_COORDINATE_DELTAS = {
  UP: {
    rowIndex: -1,
    columnIndex: 0,
  },
  RIGHT: {
    rowIndex: 0,
    columnIndex: 1,
  },
  DOWN: {
    rowIndex: 1,
    columnIndex: 0,
  },
  LEFT: {
    rowIndex: 0,
    columnIndex: -1,
  },
};
const FALLING_PUYO_FREE_FALL_INTERVAL = 300;
const FALLING_PUYO_ROTATION = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

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

  static _getSquare(puyopuyoFieldSquareMatrix, rowIndex, columnIndex) {
    const line = puyopuyoFieldSquareMatrix[rowIndex];
    if (!line) {
      return null;
    }
    return line[columnIndex] || null;
  }

  static _canPlacePuyo(puyopuyoFieldSquareMatrix, rowIndex, columnIndex) {
    const square = Store._getSquare(puyopuyoFieldSquareMatrix, rowIndex, columnIndex);
    if (!square) {
      return false;
    }
    return square.colorType === PUYOPUYO_COLOR_TYPES.NONE;
  }

  static _convertFallingPuyoToSquares(coordinate, colorTypes, direction) {
    const baseSquare = Object.assign({}, coordinate, {
      colorType: colorTypes[0],
    });
    const delta = DIRECTIONS_TO_COORDINATE_DELTAS[direction];
    const followingSquare = {
      rowIndex: coordinate.rowIndex + delta.rowIndex,
      columnIndex: coordinate.columnIndex + delta.columnIndex,
      colorType: colorTypes[1],
    };

    return [baseSquare, followingSquare];
  }

  constructor() {
    // It has a "change" event only.
    this._emitter = new EventEmitter();

    this._state = {
      fallingPuyo: {
        coordinate: {
          rowIndex: 0,
          columnIndex: 2,
        },
        isFalling: true,
        lastMovedAt: 0,
        colorTypes: ['RED', 'YELLOW'],
        direction: DIRECTIONS.UP,
      },
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

  static generateFallingPuyoSquares(state) {
    return state.fallingPuyo.isFalling
      ? Store._convertFallingPuyoToSquares(
        state.fallingPuyo.coordinate,
        state.fallingPuyo.colorTypes,
        state.fallingPuyo.direction
      )
      : []
    ;
  }

  static _nextGameLoopState(state) {
    let newState = state;

    // Falling Puyo
    if (state.fallingPuyo.isFalling) {
      // TODO: Apply control

      // Apply free fall
      if (state.fallingPuyo.lastMovedAt + FALLING_PUYO_FREE_FALL_INTERVAL <= newState.gameTime) {
        const nextCoordinate = {
          rowIndex: state.fallingPuyo.coordinate.rowIndex + 1,
          columnIndex: state.fallingPuyo.coordinate.columnIndex,
        };
        const fallingPuyoSquares = Store.generateFallingPuyoSquares(newState);
        const nextFallingPuyoSquares = fallingPuyoSquares.map(square => {
          return Object.assign({}, square, {
            rowIndex: square.rowIndex + 1,
          });
        });

        // Touch the ground/other-puyos or not
        if (
          nextFallingPuyoSquares.some(square => {
            return !Store._canPlacePuyo(
              newState.puyopuyoFieldSquareMatrix,
              square.rowIndex,
              square.columnIndex
            );
          })
        ) {
          fallingPuyoSquares.forEach(square => {
            newState = icepick.assocIn(
              newState,
              ['puyopuyoFieldSquareMatrix', square.rowIndex, square.columnIndex, 'colorType'],
              square.colorType
            );
          });
          newState = icepick.assocIn(newState, ['fallingPuyo'], {
            // TODO: Generalize the shape
            coordinate: {
              rowIndex: 0,
              columnIndex: 2,
            },
            isFalling: true,
            lastMovedAt: 0,
            colorTypes: ['RED', 'YELLOW'],
            direction: DIRECTIONS.UP,
          });
        } else {
          newState = icepick.assocIn(newState, ['fallingPuyo', 'coordinate'], nextCoordinate);
          newState = icepick.assocIn(newState, ['fallingPuyo', 'lastMovedAt'], newState.gameTime);
        }
      }
    } else {
      // TODO: Reserve new falling puyo
    }

    // Game time
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
