# next-cache-toolbar [![Version](https://img.shields.io/npm/v/next-cache-toolbar.svg?colorB=green)](https://www.npmjs.com/package/next-cache-toolbar)

A toolbar that helps to identify [data cache](https://nextjs.org/docs/app/building-your-application/caching#data-cache) entries

![Example app](./assets/app.jpg)

![Example toolbar open](./assets/app-toolbar-open.jpg)

![Example body open](./assets/app-body-open.jpg)
## How to use it?

`next-cache-toolbar` requires to use [app router](https://nextjs.org/docs/app/building-your-application/caching#data-cache)

Supported versions: Next.js 15 and 16 (including canary) with React 19. Next.js 14 no longer gets updates and is not supported anymore, use `next-cache-toolbar@0.4` with it.

Create file that we will lazy loading later to avoid bundling `next-cache-toolbar` in production
```jsx
// app/toolbar.jsx
import { NextCacheToolbar } from "next-cache-toolbar";
import "next-cache-toolbar/style.css";

export default function Toolbar() {
	return <NextCacheToolbar />;
}
```


```jsx
// app/layout.jsx
import dynamic from "next/dynamic";

let Toolbar = () => null;

if (process.env.NODE_ENV === "development") {
	Toolbar = dynamic(() => import("./toolbar"));
}

export default function Layout({ children }) {
  return (
    <html>
      <head/>
      <body>
        {children}
        <Toolbar />
      </body>
    </html>
  );
}
```

Keep the check on `process.env.NODE_ENV`. Next.js replaces it with a constant during `next build`, so the `import("./toolbar")` branch is removed from production builds together with the toolbar's code, styles and server actions.

Do not gate the toolbar on your own environment variable alone (e.g. `process.env.NEXT_PUBLIC_SHOW_TOOLBAR === "true"`). If that variable is not set while running `next build`, the check stays a runtime lookup, and the toolbar is bundled into production even though it never renders.

## How does `data cache` work?

There are two cases when `data cache` is used:
 - wrapping any function with `unstable_cache`
 - adding `next` options to `fetch` call

Both cases will store returned data inside `.next/cache/fetch-cache` folder in format 

```json
{
  "kind": "FETCH",
  "revalidate": 30,
  "tags": [],
  "data": {
    "body": "...",
    "headers": {},
    "status": 200,
    "url": "..."
  }
}
```

There is one caveat, when using `unstable_cache` stored data will do not have any headers while body will be in plain JSON.
But when using `fetch` with `next` options all headers from response will be present and `body` will be encoded using base64.
Nevertheless both of these approaches stores all data as well as `revalidate` time and `tags`.


