import type { Message } from "discord.js";
import type { BotClient } from "../core/BotClient";
import Event from "../event/Event";

export default class MessageDelete extends Event {
    public constructor() {
        super("messageDelete");
    }

    public async callback(client: BotClient, message: Message): Promise<void> {
        if (!message.guild) {
            return;
        }

        const guild = await client.database.getGuild(message.guild.id);
        if (!guild) {
            return;
        }

        if (guild.menus.find(menu => menu.message === message.id)) {
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id, "menus.message": message.id }, { "$unset": { "menus.$.message": "" } });
    }
}
