# next-16-cache-directive

Example app for `next-cache-toolbar` with the [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive (`cacheComponents: true`).

```sh
echo "GITHUB_TOKEN=<token>" > .env.local # optional, avoids GitHub API rate limits
pnpm dev                                # http://localhost:3017
```

| Where | What |
| --- | --- |
| `src/lib/server-info.ts` | file level `"use cache"`, `cacheLife` profile and custom `cacheLife` values |
| `src/lib/github.ts` | function level `"use cache"` with tags, `"use cache: remote"` |
| `src/app/repo-card.tsx` | component level `"use cache"` (cached JSX with a client component) |
| `src/app/[owner]/repo/[repo]/page.tsx` | inline `"use cache"` capturing variables from its closure |
| `src/app/actions.ts` | `updateTag` server actions |
| `src/instrumentation.ts` | `registerNextCacheToolbar()` to record entries from the first request |
