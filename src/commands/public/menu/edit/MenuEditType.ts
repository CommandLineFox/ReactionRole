import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";

export default class MenuEditType extends Subcommand {
    public constructor() {
        super("type", "Edit a specified role menu's type");
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
        const type = interaction.options.getString("type", true) as MenuType;

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

        if (menu.type === type) {
            await interaction.reply({ content: "The type is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$set": { "menus.$.type": type } });
        await interaction.reply(`Successfully updated ${name}'s description to ${type}.`);
    }
}
