export function getGithubAuthHeaders(): HeadersInit {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		return {};
	}
	return { Authorization: `Bearer ${token}` };
}
