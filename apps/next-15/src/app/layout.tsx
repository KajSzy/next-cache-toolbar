import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Toolbar />
			</body>
		</html>
	);
}
