import { ChannelType, CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";
import { deleteMessage } from "../../../../utils/Utils";

export default class MenuEditChannel extends Subcommand {
    public constructor() {
        super("channel", "Edit a specified role menu's channel");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
                .setRequired(true)
        );
        this.data.addChannelOption(option =>
            option.setName("channel")
                .setDescription("The new channel to set the role menu to")
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
        const channel = interaction.options.getChannel("channel", true);
        if (channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: "You can only create a reaction role message in a text channel.", ephemeral: true });
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

        if (menu.channel === channel.id) {
            await interaction.reply({ content: "The role menu is already set to this channel.", ephemeral: true });
            return;
        }

        await deleteMessage(menu, interaction.guild);

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$set": { "menus.$.channel": channel.id }, "$unset": { "menus.$.message": "" } });
        await interaction.reply(`Successfully updated ${name}'s channel to ${channel}.`);
    }
}
