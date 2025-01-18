# Simple RSC from scratch

Learn from https://www.youtube.com/watch?v=MaebEqhZR84

This code is a rather simple version, and only contains the first part without handling client components.

What does it mean for support RSC? If we directly call `renderToString()` for a server component and send it to the client, React will complain `"Error: Objects are not valid as a React child (found: [object Promise])"`. Trying to render a Promise object as a child in a React component is an error.

```js
// 1. tradition react
import { createElement } from 'react'
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
// Run `node --conditions react-server react.js`
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
```

> When the client receives response, it uses the `react-server-dom-webpack` library to parse the special format. When it encounters 'J' (server component), it deserializes the JSON to get an actual component; when it encounters 'M' (client component), it executes `webpack_require` at runtime to reference static resources.
