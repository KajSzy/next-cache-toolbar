export async function register() {
	// Optional: records "use cache" entries from the first request on, before the
	// toolbar is rendered. Gated like the toolbar so it is removed from production builds.
	if (
		process.env.NODE_ENV === "development" &&
		process.env.NEXT_RUNTIME === "nodejs"
	) {
		const { registerNextCacheToolbar } = await import(
			"next-cache-toolbar/instrumentation"
		);
		registerNextCacheToolbar();
	}
}
