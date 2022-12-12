import type { CommandInteraction } from "discord.js";
import Subcommand from "../../../../command/Subcommand";
import type { BotClient } from "../../../../core/BotClient";

export default class MenuEditName extends Subcommand {
    public constructor() {
        super("name", "Edit a specified role menu's name");
        this.data.addStringOption(option =>
            option.setName("name")
                .setDescription("Name of the role menu to edit")
                .setRequired(true)
        );
        this.data.addStringOption(option =>
            option.setName("newname")
                .setDescription("The new name to set the role menu to")
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
        const newName = interaction.options.getString("newname", true);

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

        if (menu.name === newName) {
            await interaction.reply({ content: "The name is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id, "menus.name": menu.name }, { "$set": { "menus.$.name": newName } });
        await interaction.reply(`Successfully updated ${name}'s name to "${newName}".`);
    }
}
