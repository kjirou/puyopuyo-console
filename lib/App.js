const {Component, Text, h, render} = require('ink');

const Root = require('./components/Root');


class App extends Component {
  static _createStateFromStore(store) {
    return store.getState();
  }

  static _mapStateToProps(state) {
    return Object.assign({}, state);
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

    return h(Root, {}, rootProps);
  }
}

module.exports = App;
