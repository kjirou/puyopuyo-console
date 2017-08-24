const {h, render} = require('ink');

const Store = require('./lib/Store');
const App = require('./lib/components/App');
const {PAD_OPERATIONS} = require('./lib/constants');


const store = new Store();

// keypress
//   - Ctrl+C と Escape による終了は ink/index.js で定義されている
//     - これを直接 OFF する方法はなさそうなので、render 後に EventEmitter の作法で初期化などを行う必要がある
//     - stdin/stdout は render の options で渡せる
//   - 押しっぱなしでも OS のリピート間隔に従って連打扱いになる
process.stdin.on('keypress', (ch, key) => {
  if (key.name === 'right') {
    store.receivePadOperation(PAD_OPERATIONS.RIGHT);
  } else if (key.name === 'left') {
    store.receivePadOperation(PAD_OPERATIONS.LEFT);
  } else if (key.name === 'down') {
    store.receivePadOperation(PAD_OPERATIONS.DOWN);
  }
});

render(h(App, {store}));

store.startGame();
