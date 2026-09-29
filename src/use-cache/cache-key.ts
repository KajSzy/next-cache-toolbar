import { reviveFlightValue } from "./flight";

export type ParsedUseCacheKey = {
	buildId: string;
	functionId: string;
	/** function arguments, closure variables come first as an array of bound arguments */
	args: unknown[];
};

/**
 * Returns the JSON array at the start of the key. Next.js may append a suffix
 * with root params (e.g. `[...]` + `lang=en`) after the encoded key parts.
 */
const extractKeyParts = (cacheKey: string) => {
	let depth = 0;
	let inString = false;
	for (let index = 0; index < cacheKey.length; index++) {
		const char = cacheKey[index];
		if (inString) {
			if (char === "\\") {
				index++;
			} else if (char === '"') {
				inString = false;
			}
			continue;
		}
		if (char === '"') {
			inString = true;
		} else if (char === "[") {
			depth++;
		} else if (char === "]") {
			depth--;
			if (depth === 0) {
				return cacheKey.slice(0, index + 1);
			}
		}
	}
	return cacheKey;
};

/**
 * "use cache" keys are `encodeReply([buildId, functionId, args, hmrRefreshHash?])`.
 * Keys encoded as FormData (arguments with Maps, Blobs, etc.) cannot be parsed.
 */
export const parseUseCacheKey = (
	cacheKey: string,
): ParsedUseCacheKey | undefined => {
	if (!cacheKey.startsWith("[")) {
		return;
	}
	try {
		const parts: unknown = JSON.parse(extractKeyParts(cacheKey));
		if (!Array.isArray(parts)) {
			return;
		}
		const [buildId, functionId, args] = parts;
		if (typeof buildId !== "string" || typeof functionId !== "string") {
			return;
		}
		const revivedArgs = reviveFlightValue(args);
		return {
			buildId,
			functionId,
			args: Array.isArray(revivedArgs) ? revivedArgs : [],
		};
	} catch {
		return;
	}
};
