const {h, render} = require('ink');

const Store = require('./lib/Store');
const App = require('./lib/components/App');


const store = new Store();

// keypress
//   - Ctrl+C と Escape による終了は ink/index.js で定義されている
//     - これを直接 OFF する方法はなさそうなので、render 後に EventEmitter の作法で初期化などを行う必要がある
//     - stdin/stdout は render の options で渡せる
//   - 押しっぱなしでも OS のリピート間隔に従って連打扱いになる
process.stdin.on('keypress', (ch, key) => {
  // do stuff
});

render(h(App, {store}));

store.startGame();
