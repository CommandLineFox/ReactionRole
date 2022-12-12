import { CommandInteraction, EmbedBuilder } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";
import { listRoles } from "../../../../utils/Utils";

export default class MenuRoleAdd extends Subcommand {
    public constructor() {
        super("list", "List all roles of a menu");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
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
            await interaction.reply({ content: "There are no roles in the role menu." });
            return;
        }

        const embed = new EmbedBuilder({ title: `List of saved roles in ${name}` })
        const list = await listRoles(menu, interaction, client);

        embed.setDescription(list);
        await interaction.reply({ content: "", embeds: [embed] });
    }
}
