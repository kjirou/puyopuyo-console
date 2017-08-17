const {h, render} = require('ink');

const App = require('./lib/App');


render(h(App));

// keypress
//   - Ctrl+C と Escape による終了は ink/index.js で定義されている
//     - これを直接 OFF する方法はなさそうなので、render 後に EventEmitter の作法で初期化などを行う必要がある
//     - stdin/stdout は render の options で渡せる
process.stdin.on('keypress', (ch, key) => {
  // do stuff
});
