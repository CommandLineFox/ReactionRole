import { ChannelType, CommandInteraction } from "discord.js";
import Subcommand from "../../../command/Subcommand";
import type { BotClient } from "../../../core/BotClient";

export default class MenuCreate extends Subcommand {
    public constructor() {
        super("create", "Create a new menu");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu")
                .setRequired(true)
        )
        this.data.addStringOption(option =>
            option.setName("title")
                .setDescription("Title of the message")
                .setRequired(true)
        );
        this.data.addStringOption(option =>
            option.setName("description")
                .setDescription("Description of the message")
                .setRequired(true)
        );
        this.data.addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel to create the message in")
                .setRequired(true)
        );
        this.data.addStringOption(option =>
            option.setName("type")
                .setDescription("Whether one or multiple roles can be chosen")
                .addChoices({ name: "One", value: "one" }, { name: "Multiple", value: "multiple" })
                .setRequired(true)
        );
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (!interaction.guild) {
            await interaction.reply({ content: "This command can only be used in servers.", ephemeral: true });
            return;
        }

        const name = interaction.options.getString("name", true);
        const title = interaction.options.getString("title", true);
        const description = interaction.options.getString("description", true);
        const channel = interaction.options.getChannel("channel", true);
        const type = interaction.options.getString("type", true) as MenuType;

        if (channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: "You can only create a reaction role message in a text channel.", ephemeral: true });
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            await interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        if (guild.menus.find(menu => menu.name.toLowerCase() === name.toLowerCase())) {
            await interaction.reply({ content: "There is already a role menu with the same name.", ephemeral: true });
            return;
        }

        client.database.guilds.updateOne({ id: interaction.guild.id }, { "$push": { "menus": { name: name, title: title, description: description, channel: channel.id, roles: [], type: type } } })
        await interaction.reply("Successfully created a new role menu.");
    }
}
