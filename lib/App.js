const {Component, Text, h, render} = require('ink');

// TODO: keypress は組み込みらしいので確認
//keypress(process.stdin);
//process.stdin.setRawMode(true);
//
//process.stdin.on('keypress', (ch, key) => {
//  if (key && key.ctrl && (key.name === 'c' || key.name === 'd')) {
//    process.stdin.pause();
//    process.exit();
//  }
//});
//

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
