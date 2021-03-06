const chalk = require('chalk');
const {Component, Text, h} = require('ink');

const CharCanvas = require('../char-canvas');
const {PUYOPUYO_FIELD_SIZE} = require('../constants');


const PUYOPUYO_FIELD_RECT = {
  x: 1,
  y: 1,
  width: PUYOPUYO_FIELD_SIZE.columnLength,
  height: PUYOPUYO_FIELD_SIZE.rowLength,
};

class Root extends Component {
  static _drawCCFrame(cc, {x, y, width, height}) {
    const x2 = x + width - 1;
    const y2 = y + height - 1;

    cc.line(x, y, x, y2, '|');
    cc.line(x2, y, x2, y2, '|');
    cc.line(x, y, x2, y, '-');
    cc.line(x, y2, x2, y2, '-');
    cc.set(x, y, '+');
    cc.set(x2, y, '+');
    cc.set(x2, y2, '+');
    cc.set(x, y2, '+');
  }

  constructor(props) {
    super(props);

    this._cc = new CharCanvas(20, 15, '.');

    Root._drawCCFrame(this._cc, {
      x: PUYOPUYO_FIELD_RECT.x - 1,
      y: PUYOPUYO_FIELD_RECT.y - 1,
      width: PUYOPUYO_FIELD_RECT.width + 2,
      height: PUYOPUYO_FIELD_RECT.height + 2,
    });
  }

  _setPuyoFromSquareState(squareState) {
    const absoluteX = squareState.columnIndex + PUYOPUYO_FIELD_RECT.x;
    const absoluteY = squareState.rowIndex + PUYOPUYO_FIELD_RECT.y;

    const symbol = {
      BLUE: chalk.blue('*'),
      GREEN: chalk.green('*'),
      NONE: ' ',
      RED: chalk.red('*'),
      YELLOW: chalk.yellow('*'),
    }[squareState.colorType];

    this._cc.set(absoluteX, absoluteY, symbol);
  }

  render(props, state) {
    const {
      fallingPuyoSquares,
      puyopuyoFieldSquareMatrix,
    } = props;

    puyopuyoFieldSquareMatrix.forEach(lineSquareStates => {
      lineSquareStates.forEach(squareState => {
        this._setPuyoFromSquareState(squareState);
      });
    });

    fallingPuyoSquares
      .filter(squareState => {
        return squareState.rowIndex >= 0 &&
          squareState.rowIndex <= PUYOPUYO_FIELD_SIZE.rowLength - 1 &&
          squareState.columnIndex >= 0 &&
          squareState.columnIndex <= PUYOPUYO_FIELD_SIZE.columnLength - 1;
      })
      .forEach(squareState => {
        this._setPuyoFromSquareState(squareState);
      });
    ;

    this._cc.drawText(9, 1, `Time:${props.gameTimeAsSeconds}`);

    return h(Text, {}, this._cc.toStringZ());
  }
}

module.exports = Root;
