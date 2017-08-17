const {Component, Text, h} = require('ink');


class Root extends Component {
  render(props, state) {
    return h(Text, {}, 'TEXT!');
  }
}

module.exports = Root;
