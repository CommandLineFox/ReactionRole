import { CommandInteraction, EmbedBuilder } from "discord.js";
import Subcommand from "../../../command/Subcommand";
import type { BotClient } from "../../../core/BotClient";
import { listInformation } from "../../../utils/Utils";

export default class MenuList extends Subcommand {
    public constructor() {
        super("list", "List all existing role menus in the server");
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (!interaction.guild) {
            await interaction.reply({ content: "This command can only be used in servers." });
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            await interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const menus = guild.menus;
        if (menus.length === 0) {
            await interaction.reply("There are no saved role menus.");
            return;
        }

        const embed = new EmbedBuilder({ title: `List of saved role menus in ${interaction.guild.name}` })
        for (const menu of menus) {
            embed.addFields({ name: menu.name, value: listInformation(menu) });
        }

        await interaction.reply({ content: "", embeds: [embed] });
    }
}
