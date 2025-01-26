import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

const root = createRoot(document.getElementById('root'));

/**
 * Fetch your server component stream from `/rsc`
 * and render results into the root element as they come in.
 * 
 * `createFromFetch` takes the response from the fetch request
 *  and parses the stream into a React component or tree.
 */
createFromFetch(fetch('/rsc')).then(comp => {
  root.render(comp);
});