import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	transpilePackages: ["geist", "github-api"],
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
