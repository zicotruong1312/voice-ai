const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { resetConfig } = require('../config/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Yêu cầu bot rời khỏi kênh thoại'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply({ content: 'Bot hiện không ở trong kênh thoại nào!', ephemeral: true });
        }

        connection.destroy();
        resetConfig(interaction.guild.id);

        await interaction.reply('Đã rời kênh thoại và reset lại quyền/ngôn ngữ về mặc định!');
    }
};
