import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

const root = createRoot(document.getElementById('root'));

/**
 * Fetch your server component stream from `/rsc`
 * and render results into the root element as they come in.
 */
createFromFetch(fetch('/rsc')).then(comp => {
  root.render(comp);
})