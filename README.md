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

## The RSC wire format
How do you turn this RSC stream into actual React elements in your browser? `react-server-dom-webpack` contains the entrypoints that takes the RSC response and re-creates the React element tree.

When the client receives response, it uses the `react-server-dom-webpack/client` library to parse the special format. When it encounters 'J' (JSON-serialized server component), it deserializes the JSON to get an actual component; when it encounters 'M' (client component module references), it executes `webpack_require` at runtime to reference static resources.

This format is very streamable — as soon as the client has read a whole row, it can parse a snippet of JSON and make some progress. If the server had encountered suspense boundaries while rendering, you would see multiple 'J' lines corresponding to each chunk as it gets resolved.
