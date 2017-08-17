const {Component, Text, h, render} = require('ink');

// TODO: Indent

class App extends Component {
  constructor() {
    super();

    this.state = {
    };
  }

  componentDidMount() {
  }

  render(props, state) {
    return [
      h(Text, {}, 'A'),
      '\n',
      h(Text, {}, 'C'),
    ];
  }
}

module.exports = App;
