import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
