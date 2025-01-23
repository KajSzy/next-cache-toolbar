import { NextCacheToolbar } from "next-cache-toolbar";
import "next-cache-toolbar/style.css";

export default function Toolbar() {
	// @ts-expect-error async component is not supported in React 18
	return <NextCacheToolbar />;
}
