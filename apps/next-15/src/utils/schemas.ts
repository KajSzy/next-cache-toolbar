import { z } from "zod";

export const repoSchema = z.object({
	id: z.number(),
	node_id: z.string(),
	name: z.string(),
	full_name: z.string(),
	private: z.boolean(),
	owner: z.object({
		login: z.string(),
		id: z.number(),
		node_id: z.string(),
		avatar_url: z.string(),
		gravatar_id: z.string(),
		url: z.string(),
		html_url: z.string(),
		followers_url: z.string(),
		following_url: z.string(),
		gists_url: z.string(),
		starred_url: z.string(),
		subscriptions_url: z.string(),
		organizations_url: z.string(),
		repos_url: z.string(),
		events_url: z.string(),
		received_events_url: z.string(),
		type: z.string(),
		user_view_type: z.string(),
		site_admin: z.boolean(),
	}),
	html_url: z.string(),
	description: z.string(),
	fork: z.boolean(),
	url: z.string(),
	forks_url: z.string(),
	keys_url: z.string(),
	collaborators_url: z.string(),
	teams_url: z.string(),
	hooks_url: z.string(),
	issue_events_url: z.string(),
	events_url: z.string(),
	assignees_url: z.string(),
	branches_url: z.string(),
	tags_url: z.string(),
	blobs_url: z.string(),
	git_tags_url: z.string(),
	git_refs_url: z.string(),
	trees_url: z.string(),
	statuses_url: z.string(),
	languages_url: z.string(),
	stargazers_url: z.string(),
	contributors_url: z.string(),
	subscribers_url: z.string(),
	subscription_url: z.string(),
	commits_url: z.string(),
	git_commits_url: z.string(),
	comments_url: z.string(),
	issue_comment_url: z.string(),
	contents_url: z.string(),
	compare_url: z.string(),
	merges_url: z.string(),
	archive_url: z.string(),
	downloads_url: z.string(),
	issues_url: z.string(),
	pulls_url: z.string(),
	milestones_url: z.string(),
	notifications_url: z.string(),
	labels_url: z.string(),
	releases_url: z.string(),
	deployments_url: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	pushed_at: z.string(),
	git_url: z.string(),
	ssh_url: z.string(),
	clone_url: z.string(),
	svn_url: z.string(),
	homepage: z.string().nullable(),
	size: z.number(),
	stargazers_count: z.number(),
	watchers_count: z.number(),
	language: z.string(),
	has_issues: z.boolean(),
	has_projects: z.boolean(),
	has_downloads: z.boolean(),
	has_wiki: z.boolean(),
	has_pages: z.boolean(),
	has_discussions: z.boolean(),
	forks_count: z.number(),
	mirror_url: z.null(),
	archived: z.boolean(),
	disabled: z.boolean(),
	open_issues_count: z.number(),
	license: z
		.object({
			key: z.string(),
			name: z.string(),
			spdx_id: z.string(),
			url: z.string(),
			node_id: z.string(),
		})
		.nullable(),
	allow_forking: z.boolean(),
	is_template: z.boolean(),
	web_commit_signoff_required: z.boolean(),
	topics: z.array(z.string()),
	visibility: z.string(),
	forks: z.number(),
	open_issues: z.number(),
	watchers: z.number(),
	default_branch: z.string(),
	permissions: z.object({
		admin: z.boolean(),
		maintain: z.boolean(),
		push: z.boolean(),
		triage: z.boolean(),
		pull: z.boolean(),
	}),
	score: z.number(),
});

export const issueSchema = z.object({
	url: z.string(),
	repository_url: z.string(),
	labels_url: z.string(),
	comments_url: z.string(),
	events_url: z.string(),
	html_url: z.string(),
	id: z.number(),
	node_id: z.string(),
	number: z.number(),
	title: z.string(),
	user: z.object({
		login: z.string(),
		id: z.number(),
		node_id: z.string(),
		avatar_url: z.string(),
		gravatar_id: z.string(),
		url: z.string(),
		html_url: z.string(),
		followers_url: z.string(),
		following_url: z.string(),
		gists_url: z.string(),
		starred_url: z.string(),
		subscriptions_url: z.string(),
		organizations_url: z.string(),
		repos_url: z.string(),
		events_url: z.string(),
		received_events_url: z.string(),
		type: z.string(),
		user_view_type: z.string(),
		site_admin: z.boolean(),
	}),
	labels: z.array(z.unknown()),
	state: z.string(),
	locked: z.boolean(),
	assignee: z.null(),
	assignees: z.array(z.unknown()),
	milestone: z.unknown(),
	comments: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
	closed_at: z.null(),
	author_association: z.string(),
	active_lock_reason: z.null(),
	body: z.string().nullable(),
	reactions: z.object({
		url: z.string(),
		total_count: z.number(),
		"+1": z.number(),
		"-1": z.number(),
		laugh: z.number(),
		hooray: z.number(),
		confused: z.number(),
		heart: z.number(),
		rocket: z.number(),
		eyes: z.number(),
	}),
	timeline_url: z.string(),
	performed_via_github_app: z.null(),
	state_reason: z.string().nullable(),
	score: z.number(),
});
