"use cache";

// File level "use cache": every export of this module is a cached function.
// These entries do not need network access, so the toolbar always has
// something to show even without a GITHUB_TOKEN.

import { cacheLife, cacheTag } from "next/cache";

export async function getServerInfo() {
	cacheLife("minutes");
	cacheTag("server-info");

	return {
		generatedAt: new Date(),
		nodeVersion: process.version,
		random: Math.round(Math.random() * 1000),
	};
}

export async function getLuckyNumbers(seed: number, count = 3) {
	cacheLife({ stale: 60, revalidate: 120, expire: 3600 });

	return Array.from(
		{ length: count },
		(_, index) => (seed * (index + 7)) % 100,
	);
}
