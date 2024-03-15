export async function getMostPopularRepositories(owner: string) {
	try {
		const url = new URL("https://api.github.com/search/repositories");
		url.searchParams.set("q", `org:${owner}`);
		url.searchParams.set("sort", "stars");
		url.searchParams.set("direction", "desc");
		url.searchParams.set("per_page", "5");
		const result = await fetch(url, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
			next: {
				revalidate: 30,
				tags: ["repos", owner],
			},
		});
		const data = await result.json();
		return data.items;
	} catch (error) {
		console.error(error);
		throw Error("Error fetching issues");
	}
}

export async function getIssues(owner: string, repo: string) {
	try {
		const url = new URL("https://api.github.com/search/issues");
		url.searchParams.set("q", `type:issue is:open org:${owner} repo:${repo}`);
		url.searchParams.set("sort", "stars");
		url.searchParams.set("direction", "desc");
		url.searchParams.set("per_page", "5");
		const result = await fetch(url, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
			next: {
				revalidate: 3600,
				tags: ["issues", owner, repo],
			},
		});
		const data = await result.json();
		return data.items;
	} catch (error) {
		console.error(error);
		throw Error("Error fetching issues");
	}
}
