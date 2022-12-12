import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../command/Subcommand";
import type { BotClient } from "../../../core/BotClient";
import { deleteMessage } from "../../../utils/Utils";

export default class MenuDelete extends Subcommand {
    public constructor() {
        super("delete", "Delete an existing reaction role menu");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to delete")
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

        await deleteMessage(menu, interaction.guild);

        await client.database.guilds.updateOne({ id: interaction.guild.id }, { "$pull": { "menus": menu } });
        await interaction.reply(`Successfully deleted the role menu named ${name}.`);
    }
}
