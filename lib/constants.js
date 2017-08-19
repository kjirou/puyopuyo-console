const ticksPerSecond = 50;
const tickInterval = 1000 / ticksPerSecond;
if (Math.ceil(tickInterval) !== tickInterval) {
  throw new Error(`The tick-interval must be an integer`);
}

const PARAMETERS = {
  TICK_INTERVAL: tickInterval,
  TICKS_PER_SECOND: ticksPerSecond,
};

const PUYOPUYO_COLOR_TYPES = {
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  NONE: 'NONE',
  RED: 'RED',
  YELLOW: 'YELLOW',
};

const PUYOPUYO_FIELD_SIZE = {
  columnLength: 6,
  rowLength: 13,
};

module.exports = {
  PARAMETERS,
  PUYOPUYO_COLOR_TYPES,
  PUYOPUYO_FIELD_SIZE,
};
