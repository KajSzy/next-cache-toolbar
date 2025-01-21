"use server";

import { promises } from "node:fs";

const cachePath = ".next/cache/fetch-cache";

export const purgeCache = async () => {
	await promises.rm(cachePath, { recursive: true, force: true });
};
