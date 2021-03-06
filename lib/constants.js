const gameLoopsPerSecond = 50;
const gameLoopInterval = 1000 / gameLoopsPerSecond;
if (Math.ceil(gameLoopInterval) !== gameLoopInterval) {
  throw new Error(`The game-loop-interval must be an integer`);
}

const DIRECTIONS = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};

const PAD_OPERATIONS  = {
  CANCEL: 'CANCEL',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  NONE: 'NONE',
  OK: 'OK',
  RIGHT: 'RIGHT',
  UP: 'UP',
};

const PARAMETERS = {
  GAME_LOOP_INTERVAL: gameLoopInterval,
  GAME_LOOPS_PER_SECOND: gameLoopsPerSecond,
};

const PUYOPUYO_COLOR_TYPES = {
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  NONE: 'NONE',
  RED: 'RED',
  YELLOW: 'YELLOW',
};

const PUYOPUYO_CONTROLLABLE_COLORS = [
  PUYOPUYO_COLOR_TYPES.BLUE,
  PUYOPUYO_COLOR_TYPES.GREEN,
  PUYOPUYO_COLOR_TYPES.RED,
  PUYOPUYO_COLOR_TYPES.YELLOW,
];

const PUYOPUYO_FIELD_SIZE = {
  columnLength: 6,
  rowLength: 13,
};

module.exports = {
  DIRECTIONS,
  PAD_OPERATIONS,
  PARAMETERS,
  PUYOPUYO_COLOR_TYPES,
  PUYOPUYO_CONTROLLABLE_COLORS,
  PUYOPUYO_FIELD_SIZE,
};
