const {Component, h} = require('ink');

const {PARAMETERS} = require('../constants');
const Root = require('./Root');


class App extends Component {
  static _createStateFromStore(store) {
    return store.getState();
  }

  static _mapStateToProps(state) {
    const gameTime = PARAMETERS.TICK_INTERVAL * state.tickId;
    const gameTimeAsSeconds = Math.floor(gameTime / 1000);

    return Object.assign({}, state, {
      gameTime,
      gameTimeAsSeconds,
    });
  }

  constructor(props, context) {
    super(props, context);

    this.state = App._createStateFromStore(props.store);

    props.store.emitter.on('change', () => {
      this.setState(App._createStateFromStore(props.store));
    });
  }

  componentDidMount() {
  }

  render(props, state) {
    const rootProps = App._mapStateToProps(this.state);

    return h(Root, rootProps);
  }
}

module.exports = App;
