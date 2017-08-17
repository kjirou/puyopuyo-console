const EventEmitter = require('events');


class Store {
  constructor() {
    // It has a "change" event only.
    this._emitter = new EventEmitter();

    this._state = {};
  }

  get emitter() {
    return this._emitter;
  }

  getState() {
    return this._state;
  }
}

module.exports = Store;
