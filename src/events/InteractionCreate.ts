import { ButtonInteraction, CommandInteraction, Interaction, PermissionFlagsBits, Role, StringSelectMenuInteraction } from "discord.js";
import type { BotClient } from "../core/BotClient";
import type Command from "../command/Command";
import Event from "../event/Event";
import { generateInteractionName } from "../utils/Utils";

export default class InteractionCreate extends Event {
    public constructor() {
        super("interactionCreate");
    }

    public async callback(client: BotClient, interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            return handleCommandInteraction(client, interaction);
        }
        if (interaction.isStringSelectMenu()) {
            return handleSelectMenuInteraction(client, interaction);
        }
        if (interaction.isButton()) {
            return handleButtonInteraction(client, interaction);
        }
    }
}

async function handleCommandInteraction(client: BotClient, interaction: CommandInteraction): Promise<void> {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        return;
    }

    if (!hasUserPermission(command, interaction)) {
        await interaction.reply({ content: "You're not allowed to execute this command", ephemeral: true });
        return;
    }
    if (!hasBotPermission(command, interaction)) {
        await interaction.reply({ content: "I'm not allowed to execute this command", ephemeral: true });
    }
    try {
        command.execute(interaction, client);
    } catch (error) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

async function handleSelectMenuInteraction(client: BotClient, interaction: StringSelectMenuInteraction): Promise<void> {
    if (!interaction.guild) {
        return;
    }

    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.reply({ content: "The bot doesn't have permission to edit roles.", ephemeral: true });
        return;
    }

    if (!interaction.member) {
        return;
    }

    const guild = await client.database.getGuild(interaction.guild.id);
    if (!guild) {
        return;
    }

    const menu = guild.menus.find(menu => menu.message === interaction.message.id);
    if (!menu) {
        return;
    }

    const choices = interaction.values;
    const list = [] as Role[];
    for (const choice of choices) {
        const role = await interaction.guild?.roles.fetch(choice);
        if (!role) {
            await client.database.guilds.updateOne({ id: interaction.guild?.id, "menus.name": generateInteractionName(menu.name) }, { "$pull": { "menus.$.roles": choice } });
            continue;
        }

        list.push(role);
    }

    const member = await interaction.guild.members.fetch(interaction.member.user.id);
    await member.roles.add(list);
    await interaction.reply({ content: "Added selected roles in this menu to your profile.", ephemeral: true });
}

async function handleButtonInteraction(client: BotClient, interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guild) {
        return;
    }

    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.reply({ content: "The bot doesn't have permission to edit roles.", ephemeral: true });
        return;
    }

    if (!interaction.member) {
        return;
    }

    const guild = await client.database.getGuild(interaction.guild.id);
    if (!guild) {
        return;
    }

    const menu = guild.menus.find(menu => menu.message === interaction.message.id);
    if (!menu) {
        return;
    }

    const member = await interaction.guild.members.fetch(interaction.member.user.id);
    const list = [] as Role[];
    for (const menuRole of menu.roles) {
        const role = await interaction.guild?.roles.fetch(menuRole.id);
        if (!role) {
            await client.database.guilds.updateOne({ id: interaction.guild?.id, "menus.name": generateInteractionName(menu.name) }, { "$pull": { "menus.$.roles": menuRole } });
            continue;
        }

        if (member.roles.cache.has(role.id)) {
            list.push(role);
        }
    }

    await member.roles.remove(list);
    await interaction.reply({ content: "Removed all roles in this menu from your profile.", ephemeral: true });
}

function hasUserPermission(command: Command, interaction: CommandInteraction): boolean {
    if (!command.userPermissions) {
        return true;
    }

    if (!interaction.memberPermissions) {
        return false;
    }

    return interaction.memberPermissions.has(command.userPermissions);
}

function hasBotPermission(command: Command, interaction: CommandInteraction): boolean {
    if (!command.botPermissions) {
        return true;
    }

    if (!interaction.guild?.members.me?.permissions) {
        return false;
    }

    return interaction.guild.members.me.permissions.has(command.botPermissions);
}
