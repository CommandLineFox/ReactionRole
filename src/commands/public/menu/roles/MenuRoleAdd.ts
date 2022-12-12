import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";
import { checkEmoji } from "../../../../utils/Utils";

export default class MenuRoleAdd extends Subcommand {
    public constructor() {
        super("add", "Add a role to a specified role menu");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
                .setRequired(true)
        );
        this.data.addRoleOption(option =>
            option.setName("role")
                .setDescription("The role to add to the role menu")
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

        const position = interaction.guild.members.me?.roles.highest.position;
        if (position && position <= role.position) {
            await interaction.reply({ content: "The role is higher or equal to the bot's highest role, the bot would be unable to apply it.", ephemeral: true });
            return;
        }

        const menu = guild.menus.find(menu => menu.name === name);
        if (!menu) {
            await interaction.reply({ content: "There is no role menu with that name.", ephemeral: true });
            return;
        }

        const menuRole = menu.roles.find(r => r.id === role.id);
        if (menuRole) {
            await interaction.reply({ content: "The role menu already includes this role.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$push": { "menus.$.roles": { id: role.id, emoji: emoji } } });
        await interaction.reply(`Successfully added ${role.name} to ${name}'s role list.`);
    }
}
