const EventEmitter = require('events');
const flatten = require('flatten');
const icepick = require('icepick');
const MatchNScanner = require('match-n-scanner');

const {
  PAD_OPERATIONS,
  PARAMETERS,
  PUYOPUYO_COLOR_TYPES,
  PUYOPUYO_CONTROLLABLE_COLORS,
  PUYOPUYO_FIELD_SIZE,
} = require('./constants');


const DIRECTIONS = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};
const DIRECTION_ROTATION_ORDER = [
  DIRECTIONS.UP,
  DIRECTIONS.RIGHT,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT,
];
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

    for (let rowIndex = 0; rowIndex < rowLength; rowIndex += 1) {
      const line = [];
      matrix.push(line);

      for (let columnIndex = 0; columnIndex < columnLength; columnIndex += 1) {
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

  static _canPlaceFallingPuyoOnSquares(coordinate, colorTypes, direction, puyopuyoFieldSquareMatrix) {
    const squares = Store._convertFallingPuyoToSquares(coordinate, colorTypes, direction);

    return squares.every(square => {
      return Store._canPlacePuyo(
        puyopuyoFieldSquareMatrix,
        square.rowIndex,
        square.columnIndex
      );
    });
  }

  static _rotateDirection(direction, isClockwise) {
    const currentIndex = DIRECTION_ROTATION_ORDER.indexOf(direction);
    if (currentIndex === -1) {
      throw new Error('Improbable direction');
    }

    const delta = isClockwise ? 1 : -1;
    const nextIndex = (currentIndex + delta + DIRECTION_ROTATION_ORDER.length) % DIRECTION_ROTATION_ORDER.length;

    return DIRECTION_ROTATION_ORDER[nextIndex];
  }

  static _findMatchedSquaresSets(puyopuyoFieldSquareMatrix) {
    const scanner = new MatchNScanner(puyopuyoFieldSquareMatrix, {
      equalityChecker: (a, b) => a.colorType === b.colorType,
    });

    const matches = scanner.scan({
      minMatchLength: 4,
      sieve: (square) => PUYOPUYO_CONTROLLABLE_COLORS.indexOf(square.colorType) !== -1,
    });

    return matches
      .map(match => {
        return match.map(indexedSquare => indexedSquare.element);
      })
    ;
  }

  constructor() {
    // It has a "change" event only.
    this._emitter = new EventEmitter();

    this._state = {
      fallingPuyo: Store._createFallingPuyoState(),
      padOperation: PAD_OPERATIONS.NONE,
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

  static _createFallingPuyoState() {
    return {
      coordinate: {
        rowIndex: 0,
        columnIndex: 2,
      },
      isFalling: true,
      lastMovedAt: 0,
      colorTypes: [1, 2].map(() => PUYOPUYO_CONTROLLABLE_COLORS[Math.floor(Math.random() * 4)]),
      direction: DIRECTIONS.UP,
    };
  }

  static _nextGameLoopState(state) {
    let newState = state;

    // Falling Puyo
    if (state.fallingPuyo.isFalling) {
      // Apply pad operation
      if (state.padOperation !== PAD_OPERATIONS.NONE) {
        const nextCoordinate = {
          rowIndex: state.fallingPuyo.coordinate.rowIndex,
          columnIndex: state.fallingPuyo.coordinate.columnIndex,
        };
        let nextDirection = state.fallingPuyo.direction;

        if (state.padOperation === PAD_OPERATIONS.RIGHT) {
          nextCoordinate.columnIndex += 1;
        } else if (state.padOperation === PAD_OPERATIONS.LEFT) {
          nextCoordinate.columnIndex -= 1;
        } else if (state.padOperation === PAD_OPERATIONS.DOWN) {
          nextCoordinate.rowIndex += 1;
        } else if (state.padOperation === PAD_OPERATIONS.OK) {
          nextDirection = Store._rotateDirection(nextDirection, false);
        } else if (state.padOperation === PAD_OPERATIONS.CANCEL) {
          nextDirection = Store._rotateDirection(nextDirection, true);
        }

        if (
          Store._canPlaceFallingPuyoOnSquares(
            nextCoordinate,
            newState.fallingPuyo.colorTypes,
            nextDirection,
            newState.puyopuyoFieldSquareMatrix
          )
        ) {
          newState = icepick.assocIn(newState, ['fallingPuyo', 'coordinate'], nextCoordinate);
          newState = icepick.assocIn(newState, ['fallingPuyo', 'direction'], nextDirection);
        }

        newState = icepick.assocIn(newState, ['padOperation'], PAD_OPERATIONS.NONE);
      }

      // Apply free fall
      if (state.fallingPuyo.lastMovedAt + FALLING_PUYO_FREE_FALL_INTERVAL <= newState.gameTime) {
        const nextCoordinate = {
          rowIndex: state.fallingPuyo.coordinate.rowIndex + 1,
          columnIndex: state.fallingPuyo.coordinate.columnIndex,
        };

        // Touch the ground/other-puyos or not
        if (
          !Store._canPlaceFallingPuyoOnSquares(
            nextCoordinate,
            newState.fallingPuyo.colorTypes,
            newState.fallingPuyo.direction,
            newState.puyopuyoFieldSquareMatrix
          )
        ) {
          Store.generateFallingPuyoSquares(newState).forEach(square => {
            newState = icepick.assocIn(
              newState,
              ['puyopuyoFieldSquareMatrix', square.rowIndex, square.columnIndex, 'colorType'],
              square.colorType
            );
          });
          newState = icepick.assocIn(newState, ['fallingPuyo'], Store._createFallingPuyoState());
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

  receivePadOperation(padOperation) {
    if (this._state.padOperation === PAD_OPERATIONS.NONE) {
      this._state = icepick.assocIn(this._state, ['padOperation'], padOperation);
    }
  }
}

module.exports = Store;
