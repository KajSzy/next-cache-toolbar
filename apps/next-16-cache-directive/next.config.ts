import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// enables the "use cache" directive (Next.js 16+)
	cacheComponents: true,
	transpilePackages: ["geist", "github-api"],
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
