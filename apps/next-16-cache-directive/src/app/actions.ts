"use server";

import { updateTag } from "next/cache";

export async function refreshRepositories() {
	updateTag("repos");
}

export async function refreshServerInfo() {
	updateTag("server-info");
}
