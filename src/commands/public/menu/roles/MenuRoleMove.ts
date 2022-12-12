import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";

export default class MenuRoleRemove extends Subcommand {
    public constructor() {
        super("move", "Move a role from a specified role menu to a new position");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
                .setRequired(true)
        );
        this.data.addRoleOption(option =>
            option.setName("role")
                .setDescription("The role to remove from the role menu")
                .setRequired(true)
        );
        this.data.addNumberOption(option =>
            option.setName("position")
                .setDescription("New position for the role")
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
        const position = interaction.options.getNumber("position", true);

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

        if (menu.roles.length < position) {
            await interaction.reply({ content: "The provided position exceeds the amount of roles in the role menu.", ephemeral: true });
            return;
        }

        let current = menu.roles.indexOf(menuRole);
        if (current === position - 1) {
            await interaction.reply({ content: "The role is already in that position", ephemeral: true });
            return;
        }

        const temp = menu.roles[position - 1];
        if (!temp) {
            await interaction.reply({ content: "There was an error during switching roles.", ephemeral: true });
            return;
        }

        menu.roles[position - 1] = menuRole;
        menu.roles[current] = temp;

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$set": { "menus.$": menu } });
        await interaction.reply(`Successfully moved ${role.name} from position ${current}  to ${position}.`);
    }
}
