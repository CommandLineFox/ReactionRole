import type { BotClient } from "../core/BotClient";
import Event from "../event/Event";

export default class Ready extends Event {
    public constructor() {
        super("ready");
    }

    public async callback(client: BotClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);
    }
}
