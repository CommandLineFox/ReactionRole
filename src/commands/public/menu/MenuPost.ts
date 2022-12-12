import type { CommandInteraction, TextChannel } from "discord.js";
import Subcommand from "../../../command/Subcommand";
import type { BotClient } from "../../../core/BotClient";
import { createMessage, deleteMessage } from "../../../utils/Utils";

export default class MenuPost extends Subcommand {
    public constructor() {
        super("post", "Post or repost the role menu in a specified channel");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to post")
                .setRequired(true)
        );
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (!interaction.guild) {
            await interaction.reply({ content: "This command can only be used in servers." });
            return;
        }

        const name = interaction.options.getString("name", true);
        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            await interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const menu = guild.menus.find(menu => menu.name === name);
        if (!menu) {
            await interaction.reply({ content: "There is no role menu with that name.", ephemeral: true });
            return;
        }

        if (menu.roles.length === 0) {
            await interaction.reply({ content: "The menu is empty, therefor it will not be posted.", ephemeral: true });
            return;
        }

        const channel = await interaction.guild.channels.fetch(menu.channel);
        if (!channel) {
            await interaction.reply({ content: "Couldn't find the channel to post the message in", ephemeral: true });
            return;
        }

        await deleteMessage(menu, interaction.guild);

        const content = await createMessage(menu, interaction, client);
        if (typeof content === "string") {
            await interaction.reply({ content: `Coulddn't find the custom emoji of ${content}` });
            return;
        }

        const message = await (channel as TextChannel).send(content)
        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$set": { "menus.$.message": message.id } });
        await interaction.reply(`Menu sent, you can find it here [here](${message.url})`);
    }
}
