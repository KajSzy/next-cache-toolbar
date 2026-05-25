import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	transpilePackages: ["geist"],
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
