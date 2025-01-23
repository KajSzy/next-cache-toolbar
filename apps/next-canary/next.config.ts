import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	transpilePackages: ["geist"],
	devIndicators: {
		buildActivityPosition: "bottom-left",
		buildActivity: true,
		appIsrStatus: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
