import { existsSync } from "node:fs";

/**
 * Resolves the fetch cache directory for the current Next.js server.
 * Since Next.js 16 the dev server writes its output to `<distDir>/dev`.
 */
export const getFetchCachePath = (distDir: string) => {
	const devDistDir = `${distDir}/dev`;
	if (process.env.NODE_ENV === "development" && existsSync(devDistDir)) {
		return `${devDistDir}/cache/fetch-cache`;
	}
	return `${distDir}/cache/fetch-cache`;
};
