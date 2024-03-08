# next-cache-toolbar [![Version](https://img.shields.io/npm/v/next-cache-toolbar.svg?colorB=green)](https://www.npmjs.com/package/next-cache-toolbar)

A toolbar that helps to identify [data cache](https://nextjs.org/docs/app/building-your-application/caching#data-cache) entries

![Example](./assets/example_image.png)

## Preview cached body

![Example](./assets/body_preview.png)

## Use

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
let Toolbar: React.ComponentType = () => null;

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
