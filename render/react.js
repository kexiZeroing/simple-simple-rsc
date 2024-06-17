import { createElement } from 'react'

// 1. tradition react
const App = () => createElement('h1', null, 'Hello')
console.log(createElement(App))
// {
//   '$$typeof': Symbol(react.element),
//   type: [Function: App],
//   key: null,
//   ref: null,
//   props: {},
//   _owner: null,
//   _store: {}
// }

// 2. ssr
import { renderToPipeableStream } from 'react-dom/server'
renderToPipeableStream(createElement(App)).pipe(process.stdout)
// <h1>Hello</h1>

// 3. serialize
import pkg from 'react-server-dom-webpack/server';
const { renderToPipeableStream } = pkg;
// Run `node --conditions react-server render/react.js`
renderToPipeableStream(createElement(App)).pipe(process.stdout)
// 0:["$","h1",null,{"children":"Hello"}]

// 4. deserialize
import { createFromNodeStream } from 'react-server-dom-webpack/client'
import { PassThrough } from 'node:stream'

const passthrough = new PassThrough()
renderToPipeableStream(createElement(App)).pipe(passthrough)
createFromNodeStream(passthrough).then(console.log)
// {
//   '$$typeof': Symbol(react.element),
//   type: 'h1',
//   key: null,
//   ref: null,
//   props: { children: 'Hello' },
//   _owner: null,
//   _store: {}
// }

// promise (suspense)
const Hello = () => [
  'hello',
  new Promise((resolve) => setTimeout(() => resolve('world'), 1000))
]
renderToPipeableStream(Hello()).pipe(process.stdout)
// 0:["hello","$@1"]
// 1:"world"
