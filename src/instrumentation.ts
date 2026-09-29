import { registerUseCacheInstrumentation } from "./use-cache/registry";

/**
 * Starts recording "use cache" entries as soon as the Next.js server starts.
 * Without it, the toolbar starts recording when it is rendered for the first time.
 *
 * Call it from the `register` function in `instrumentation.ts`.
 */
export function registerNextCacheToolbar() {
	registerUseCacheInstrumentation();
}
