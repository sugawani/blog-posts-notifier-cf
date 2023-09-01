import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { fetchZennArticleMessage } from "./fetch_zenn_articles";
import { fetchWantedlyPostMessage } from "./fetch_wantedly_posts";

export interface Env extends SlackEdgeAppEnv {
	POST_CHANNEL_ID: string;
	PUBLICATION_NAME: string;
	COMPANY_ID: string;
}

export default {
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const app = new SlackApp({ env });
		ctx.waitUntil(
			app.client.chat.postMessage({
				channel: env.POST_CHANNEL_ID,
				text: await fetchZennArticleMessage(env.PUBLICATION_NAME),
				unfurl_links: false,
				unfurl_media: false,
			})
		);
		ctx.waitUntil(
			app.client.chat.postMessage({
				channel: env.POST_CHANNEL_ID,
				text: await fetchWantedlyPostMessage(env.COMPANY_ID),
				unfurl_links: false,
				unfurl_media: false,
			})
		);
	}
};