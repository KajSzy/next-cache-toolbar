import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		template: "%s | Next Cache Toolbar",
		default: "Next Cache Toolbar",
	},
	description: "Next Cache Toolbar",
};

let Toolbar: React.ComponentType = () => null;

if (process.env.NEXT_PUBLIC_IS_LOCALHOST === "true") {
	Toolbar = dynamic(() => import("./toolbar"));
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${GeistSans.className} ${GeistMono.className} antialiased`}
			>
				{children}
				<Toolbar />
			</body>
		</html>
	);
}
