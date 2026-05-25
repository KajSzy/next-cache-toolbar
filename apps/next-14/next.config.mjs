/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["geist", "github-api"],
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
