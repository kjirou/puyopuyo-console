const chalk = require('chalk');
const {Component, Text, h} = require('ink');

const CharCanvas = require('../char-canvas');


const PUYOPUYO_FIELD_RECT = {
  x: 1,
  y: 1,
  width: 6,
  height: 13,
};
const PUYOPUYO_FIELD_RECT_AS_ARRAY = [
  PUYOPUYO_FIELD_RECT.x,
  PUYOPUYO_FIELD_RECT.y,
  PUYOPUYO_FIELD_RECT.width,
  PUYOPUYO_FIELD_RECT.height,
];

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

  render(props, state) {
    this._cc.fillFnc('areaRect', ' ', ...PUYOPUYO_FIELD_RECT_AS_ARRAY);

    return h(Text, {}, this._cc.toString());
  }
}

module.exports = Root;
