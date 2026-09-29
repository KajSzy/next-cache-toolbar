import { getServerDistDir } from "./server-dist-dir";

/**
 * Resolves the fetch cache directory for the current Next.js server.
 */
export const getFetchCachePath = (distDir: string) =>
	`${getServerDistDir(distDir)}/cache/fetch-cache`;
