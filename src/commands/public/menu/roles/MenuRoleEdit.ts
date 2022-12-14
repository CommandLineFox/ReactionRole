import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";
import { checkEmoji } from "../../../../utils/Utils";

export default class MenuRoleRemove extends Subcommand {
    public constructor() {
        super("edit", "Edit the emoji of a specified role menu to a new position");
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
        this.data.addStringOption(option =>
            option.setName("emoji")
                .setDescription("The emoji that will represent the role")
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
        const emote = interaction.options.getString("emoji", true);

        const emoji = checkEmoji(emote, client);
        if (!emoji) {
            await interaction.reply({ content: "Please enter a valid emoji that the bot can see and use.", ephemeral: true });
            return;
        }

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
        await client.database.guilds.updateOne({ id: guild.id }, { $set: { 'menus.$[menu].roles.$[role].emoji': emoji } }, { arrayFilters: [{ 'menu.roles': { $elemMatch: { id: role.id } } }, { 'role.id': role.id }] });
        await interaction.reply(`Successfully set ${role.name}'s emote to ${emoji}.`);
    }
}
