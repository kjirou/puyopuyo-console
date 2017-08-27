const icepick = require('icepick');
const MatchNScanner = require('match-n-scanner');

const {
  DIRECTIONS,
  PAD_OPERATIONS,
  PARAMETERS,
  PUYOPUYO_COLOR_TYPES,
  PUYOPUYO_CONTROLLABLE_COLORS,
  PUYOPUYO_FIELD_SIZE,
} = require('./constants');


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

const DIRECTION_ROTATION_ORDER = [
  DIRECTIONS.UP,
  DIRECTIONS.RIGHT,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT,
];

const FALLING_PUYO_FREE_FALL_INTERVAL = 300;

const GAME_LOOP_DIVISION_IDS = {
  FALLING_PUYO_OPERATION_START: 'FALLING_PUYO_OPERATION_START',
  FALLING_PUYO_OPERATION_RUNNING: 'FALLING_PUYO_OPERATION_RUNNING',
  FALLING_PUYO_OPERATION_END: 'FALLING_PUYO_OPERATION_END',
};
const DIDS = GAME_LOOP_DIVISION_IDS;


const getSquare = (puyopuyoFieldSquareMatrix, rowIndex, columnIndex) => {
  const line = puyopuyoFieldSquareMatrix[rowIndex];
  if (!line) {
    return null;
  }
  return line[columnIndex] || null;
};

const canPlacePuyo = (puyopuyoFieldSquareMatrix, rowIndex, columnIndex) => {
  const square = getSquare(puyopuyoFieldSquareMatrix, rowIndex, columnIndex);
  if (!square) {
    return false;
  }
  return square.colorType === PUYOPUYO_COLOR_TYPES.NONE;
};

const rotateDirection = (direction, isClockwise) => {
  const currentIndex = DIRECTION_ROTATION_ORDER.indexOf(direction);
  if (currentIndex === -1) {
    throw new Error('Improbable direction');
  }

  const delta = isClockwise ? 1 : -1;
  const nextIndex = (currentIndex + delta + DIRECTION_ROTATION_ORDER.length) % DIRECTION_ROTATION_ORDER.length;

  return DIRECTION_ROTATION_ORDER[nextIndex];
};

const convertFallingPuyoToSquares = (coordinate, colorTypes, direction) => {
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
};

const canPlaceFallingPuyoOnSquares = (coordinate, colorTypes, direction, puyopuyoFieldSquareMatrix) => {
  const squares = convertFallingPuyoToSquares(coordinate, colorTypes, direction);

  return squares.every(square => {
    return canPlacePuyo(
      puyopuyoFieldSquareMatrix,
      square.rowIndex,
      square.columnIndex
    );
  });
};

const generatePuyopuyoFieldSquareMatrix = (rowLength, columnLength) => {
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
};

const createFallingPuyoState = () => {
  return {
    coordinate: {
      rowIndex: 0,
      columnIndex: 2,
    },
    lastMovedAt: 0,
    colorTypes: [1, 2].map(() => PUYOPUYO_CONTROLLABLE_COLORS[Math.floor(Math.random() * 4)]),
    direction: DIRECTIONS.UP,
  };
};

const findMatchedSquaresSets = (puyopuyoFieldSquareMatrix) => {
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
};

const generateFallingPuyoSquares = (state) => {
  return state.game.gameLoop.divisionId === DIDS.FALLING_PUYO_OPERATION_RUNNING
    ? convertFallingPuyoToSquares(
      state.fallingPuyo.coordinate,
      state.fallingPuyo.colorTypes,
      state.fallingPuyo.direction
    )
    : []
  ;
};

const createInitialState = () => {
  const state = {
    fallingPuyo: createFallingPuyoState(),
    game: {
      gameLoop: {
        divisionId: DIDS.FALLING_PUYO_OPERATION_START,
        id: 0,
      },
      gameTime: 0,
    },
    naturalDrops: [],
    padOperation: PAD_OPERATIONS.NONE,
    puyopuyoFieldSquareMatrix: generatePuyopuyoFieldSquareMatrix(
      PUYOPUYO_FIELD_SIZE.rowLength,
      PUYOPUYO_FIELD_SIZE.columnLength
    ),
  };

  icepick.freeze(state);

  return state;
};


//
// Game-loop logics
//

const gameLoopDivisionHandlers = {
  [DIDS.FALLING_PUYO_OPERATION_START]: (state) => {
    state = icepick.assocIn(state, ['fallingPuyo'], createFallingPuyoState());
    state = icepick.assocIn(
      state, ['game', 'gameLoop', 'divisionId'], DIDS.FALLING_PUYO_OPERATION_RUNNING);

    return state;
  },

  [DIDS.FALLING_PUYO_OPERATION_RUNNING]: (state) => {
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
        nextDirection = rotateDirection(nextDirection, false);
      } else if (state.padOperation === PAD_OPERATIONS.CANCEL) {
        nextDirection = rotateDirection(nextDirection, true);
      }

      if (
        canPlaceFallingPuyoOnSquares(
          nextCoordinate,
          state.fallingPuyo.colorTypes,
          nextDirection,
          state.puyopuyoFieldSquareMatrix
        )
      ) {
        state = icepick.assocIn(state, ['fallingPuyo', 'coordinate'], nextCoordinate);
        state = icepick.assocIn(state, ['fallingPuyo', 'direction'], nextDirection);
      }

      state = icepick.assocIn(state, ['padOperation'], PAD_OPERATIONS.NONE);
    }

    // Apply free fall
    if (state.fallingPuyo.lastMovedAt + FALLING_PUYO_FREE_FALL_INTERVAL <= state.game.gameTime) {
      const nextCoordinate = {
        rowIndex: state.fallingPuyo.coordinate.rowIndex + 1,
        columnIndex: state.fallingPuyo.coordinate.columnIndex,
      };

      // Touch the ground/other-puyos or not
      if (
        !canPlaceFallingPuyoOnSquares(
          nextCoordinate,
          state.fallingPuyo.colorTypes,
          state.fallingPuyo.direction,
          state.puyopuyoFieldSquareMatrix
        )
      ) {
        generateFallingPuyoSquares(state).forEach(square => {
          state = icepick.assocIn(
            state,
            ['puyopuyoFieldSquareMatrix', square.rowIndex, square.columnIndex, 'colorType'],
            square.colorType
          );
        });
        state = icepick.assocIn(state, ['game', 'gameLoop', 'divisionId'], DIDS.FALLING_PUYO_OPERATION_START);
      } else {
        state = icepick.assocIn(state, ['fallingPuyo', 'coordinate'], nextCoordinate);
        state = icepick.assocIn(state, ['fallingPuyo', 'lastMovedAt'], state.game.gameTime);
      }
    }

    return state;
  },
};

const calculateNextGameLoopState = (previousState) => {
  let state = previousState;

  const divisionHandler = gameLoopDivisionHandlers[state.game.gameLoop.divisionId] || ((state) => state);

  state = divisionHandler(state);

  //
  // Natural drop and matched puyo disappearance
  //

  state = icepick.assocIn(state, ['game', 'gameLoop', 'id'], state.game.gameLoop.id + 1);
  state = icepick.assocIn(state, ['game', 'gameTime'], state.game.gameTime + PARAMETERS.GAME_LOOP_INTERVAL);

  return state;
};


module.exports = {
  calculateNextGameLoopState,
  canPlaceFallingPuyoOnSquares,
  canPlacePuyo,
  convertFallingPuyoToSquares,
  createFallingPuyoState,
  createInitialState,
  findMatchedSquaresSets,
  generateFallingPuyoSquares,
  generatePuyopuyoFieldSquareMatrix,
  getSquare,
  rotateDirection,
};
