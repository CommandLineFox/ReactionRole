import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";

export default class MenuBlacklistRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove a role from a specified role menu's blacklist");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
                .setRequired(true)
        );
        this.data.addRoleOption(option =>
            option.setName("role")
                .setDescription("The role to remove")
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
        const role = interaction.options.getRole("role", true);

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

        const menuRole = menu.roles.find(r => r.id === role.id);
        if (!menuRole) {
            await interaction.reply({ content: "The role menu doesn't include this role.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$pull": { "menus.$.blacklist": menuRole } });
        await interaction.reply(`Successfully removed ${role.name} from ${name}'s blacklist.`);
    }
}
