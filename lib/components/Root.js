const chalk = require('chalk');
const {Component, Text, h} = require('ink');

const CharCanvas = require('../char-canvas');


class Root extends Component {
  constructor(props) {
    super(props);

    this._cc = new CharCanvas(20, 15, '.');

    // Puyopuyo-field frame
    this._cc.line(0, 0, 0, 14, '|');
    this._cc.line(7, 0, 7, 14, '|');
    this._cc.line(0, 0, 7, 0, '-');
    this._cc.line(0, 14, 7, 14, '-');
    this._cc.set(0, 0, '+');
    this._cc.set(7, 0, '+');
    this._cc.set(7, 14, '+');
    this._cc.set(0, 14, '+');
  }

  render(props, state) {
    return h(Text, {}, this._cc.toString());
  }
}

module.exports = Root;
