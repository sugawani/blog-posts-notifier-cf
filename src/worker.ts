import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { fetchZennArticleMessage } from "./fetch_zenn_articles";

export interface Env extends SlackEdgeAppEnv {
	POST_CHANNEL_ID: string;
	PUBLICATION_NAME: string;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const app = new SlackApp({ env });
		ctx.waitUntil(
			app.client.chat.postMessage({
				channel: env.POST_CHANNEL_ID,
				text: await fetchZennArticleMessage(env.PUBLICATION_NAME)
			}));
	},
};
