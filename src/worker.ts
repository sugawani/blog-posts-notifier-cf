import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export interface Env extends SlackEdgeAppEnv {
	POST_CHANNEL_ID: string;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const app = new SlackApp({ env });
		app.client.chat.postMessage({
			channel: env.POST_CHANNEL_ID,
			text: "test message"
		});
	},
};
