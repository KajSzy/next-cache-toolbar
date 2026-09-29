"use server";

import { promises } from "node:fs";
import { getFetchCachePath } from "../utils/fetch-cache-path";

export const purgeCache = async (distDir: string) => {
	await promises.rm(getFetchCachePath(distDir), {
		recursive: true,
		force: true,
	});
};
