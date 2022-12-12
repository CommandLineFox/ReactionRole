import type { CommandInteraction, TextChannel } from "discord.js";
import Subcommand from "../../../command/Subcommand";
import type { BotClient } from "../../../core/BotClient";
import { createMessage } from "../../../utils/Utils";

export default class MenuUpdate extends Subcommand {
    public constructor() {
        super("update", "Edit a role menu message with updated settings or roles");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to update")
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

        try {
            if (menu.message) {
                const message = await (channel as TextChannel).messages.fetch(menu.message);
                if (message) {
                    const content = await createMessage(menu, interaction, client);
                    if (typeof content === "string") {
                        await interaction.reply({ content: `Coulddn't find the custom emoji of ${content}` });
                        return;
                    }

                    await message.edit(content);
                    await interaction.reply(`Menu updated, you can find it [here](${message.url})`);
                }
            }
        } catch (e) {
            await interaction.reply({ content: "Something went wrong during trying to edit the message.", ephemeral: true });
            console.log(e);
        }
    }
}
