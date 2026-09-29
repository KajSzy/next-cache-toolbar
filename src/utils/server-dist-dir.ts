import { existsSync } from "node:fs";

/**
 * Resolves the directory the current Next.js server writes its output to.
 * Since Next.js 16 the dev server writes its output to `<distDir>/dev`.
 */
export const getServerDistDir = (distDir: string) => {
	const devDistDir = `${distDir}/dev`;
	if (process.env.NODE_ENV === "development" && existsSync(devDistDir)) {
		return devDistDir;
	}
	return distDir;
};
