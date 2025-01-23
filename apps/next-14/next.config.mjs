/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["geist"],
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
