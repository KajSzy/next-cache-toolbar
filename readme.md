# next-cache-toolbar [![Version](https://img.shields.io/npm/v/next-cache-toolbar.svg?colorB=green)](https://www.npmjs.com/package/next-cache-toolbar)

A toolbar that helps to identify [data cache](https://nextjs.org/docs/app/building-your-application/caching#data-cache) entries (`fetch`, `unstable_cache`) and [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache) entries

![Example app](./assets/app.jpg)

![Example toolbar open](./assets/app-toolbar-open.jpg)

![Example body open](./assets/app-body-open.jpg)
## How to use it?

`next-cache-toolbar` requires to use [app router](https://nextjs.org/docs/app/building-your-application/caching#data-cache)

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

The toolbar renders its content inside `<Suspense>`, because reading cache entries is uncached I/O. It works with [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) enabled without blocking the route.

### Using it with the `"use cache"` directive

Requires Next.js 16 or newer. Nothing extra is needed on the toolbar side: once the project uses `"use cache"`, its entries show up next to the data cache entries, with `use cache` in the **Source** column.

1. Enable [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), which turns on the directive:

   ```ts
   // next.config.ts
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
   	cacheComponents: true,
   };

   export default nextConfig;
   ```

2. Add `"use cache"` at the top of an async function, a component or a whole file. Set the lifetime with `cacheLife` and tags with `cacheTag`, so the toolbar has something to show in the **Revalidate** and **Tags** columns:

   ```ts
   // app/lib/data.ts
   import { cacheLife, cacheTag } from "next/cache";

   export async function getProducts(category: string) {
   	"use cache";
   	cacheLife("hours");
   	cacheTag("products", `products:${category}`);

   	const res = await fetch(`https://api.example.com/products?category=${category}`);
   	return res.json();
   }
   ```

3. With Cache Components, anything that is not cached and is read at request time (`cookies()`, `headers()`, `params`, uncached `fetch`) has to be rendered inside `<Suspense>`, otherwise Next.js reports a blocking route. The toolbar already wraps itself in `<Suspense>`.

4. Add the toolbar as described [above](#how-to-use-it) and run `next dev`. Entries are listed after the page that uses them has been rendered. After `revalidateTag`/`updateTag` is called with one of its tags, an entry shows as `REVALIDATED` until Next.js regenerates it.

5. Optionally, record entries from server start (see below).

The [`apps/next-16-cache-directive`](./apps/next-16-cache-directive) example app is a working setup. See [How does `"use cache"` work?](#how-does-use-cache-work) for how the toolbar reads these entries.

#### Recording from server start

The toolbar starts recording `"use cache"` entries when it is rendered for the first time, so entries created by the very first request after starting the server can be missed. To record entries from the start, register the toolbar in [`instrumentation.ts`](https://nextjs.org/docs/app/guides/instrumentation):

```ts
// instrumentation.ts (next to the `app` folder)
export async function register() {
	if (
		process.env.NODE_ENV === "development" &&
		process.env.NEXT_RUNTIME === "nodejs"
	) {
		const { registerNextCacheToolbar } = await import(
			"next-cache-toolbar/instrumentation"
		);
		registerNextCacheToolbar();
	}
}
```

Keep the `NODE_ENV` check for the same reason as in the layout: it removes the import from production builds.

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

## How does `"use cache"` work?

With [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) enabled, the `"use cache"` directive caches the return value of a function or a component (file, component or function level). Entries are not written to `.next/cache/fetch-cache`. They are stored by a [cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers):

 - `"use cache"` uses the `default` handler
 - `"use cache: remote"` uses the `remote` handler
 - `"use cache: <name>"` uses a custom handler configured in `cacheHandlers`
 - `"use cache: private"` does not use a cache handler at all, entries only live for the duration of a request

Without custom `cacheHandlers`, `default` and `remote` are the same in-memory LRU cache living inside the Next.js server process. Its entries are kept in a closure, there is no API to list them.

Every entry looks like

```ts
{
  value: ReadableStream<Uint8Array>, // return value serialized as a React Flight (RSC) payload
  tags: string[],                    // tags set with cacheTag() (including tags of nested caches)
  stale: number,                     // [seconds] cacheLife values
  revalidate: number,                // [seconds]
  expire: number,                    // [seconds]
  timestamp: number,                 // [ms] creation time
}
```

and is stored under a key created from `[buildId, functionId, args]` (in development it can also include an HMR refresh hash). Variables captured from the closure of an inline `"use cache"` function are passed as the first argument, e.g. `["development","e08b…",[["vercel","next.js"],"summary"]]`.

### How does the toolbar read `"use cache"` entries?

Implementation lives in [`src/use-cache`](./src/use-cache):

 - **Recording** ([`registry.ts`](./src/use-cache/registry.ts)): Next.js keeps its cache handlers in a `Map` on `globalThis[Symbol.for("@next/cache-handlers-map")]` and looks up the handler on every call. The toolbar wraps the methods of each handler in place (also handlers added later):
   - `set` tees the value stream, the copy is read in the background and stored with the entry metadata
   - `get` counts hits and misses, and marks entries that the handler no longer returns (expired or evicted) as `MISSING`
   - `updateTags` remembers when a tag was revalidated (`revalidateTag`, `updateTag`), entries with that tag created before are marked as `REVALIDATED`

   Recorded entries are kept on `globalThis` (at most 500 entries, values bigger than 1MB are not kept). Wrapping happens when the toolbar is rendered or, with `registerNextCacheToolbar()`, as soon as Next.js creates the handlers map. Custom handlers (e.g. Redis) are wrapped the same way, but the toolbar only sees entries read or written by the current process.
 - **Cache key** ([`cache-key.ts`](./src/use-cache/cache-key.ts)): the key is parsed back into build id, function id and arguments. Keys encoded as `FormData` (arguments with e.g. `Map` or `Blob`) are shown as they are.
 - **Function names** ([`function-names.ts`](./src/use-cache/function-names.ts)): the function id is a hash. The source file comes from `server-reference-manifest.json`, the name from the compiled server chunks, where the compiler emits `registerServerReference($$RSC_SERVER_CACHE_0, "<id>", null)` followed by `Object.defineProperty($$RSC_SERVER_CACHE_0, "name", { value: "<name>" })`. Results are cached per chunk.
 - **Value** ([`flight.ts`](./src/use-cache/flight.ts)): a small React Flight decoder turns the payload into JSON for the preview: references between rows are resolved, dates become ISO strings, `Map`/`Set` become `{ Map: [...] }`/`{ Set: [...] }`, React elements become `{ type, key, props }` and client components are shown as `<module#export>`. Development-only rows (debug info, console replays) are skipped.
 - **Purge**: the purge button clears the recorded entries and makes the wrapped `get` ignore every entry created before the purge, so Next.js regenerates them on the next request. The entries themselves stay in the handler until they are overwritten or evicted.

Known limitations:

 - `"use cache: private"` entries are not visible (they never reach a cache handler)
 - hits are under-counted: a cached value reused within one request, or from the prerendered page, is served without calling the cache handler
 - it relies on Next.js internals (`@next/cache-handlers-map`, the compiled output of `"use cache"`) that are not a public API and may change between versions
 - `default` and `remote` share one handler unless configured, so the **handlers** field lists both

The [`apps/next-16-cache-directive`](./apps/next-16-cache-directive) example app uses the directive at file, component and function level, with `"use cache: remote"`, closures, `cacheLife`, `cacheTag` and `updateTag`.
