const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getConfig } = require('../config/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Gọi bot vào kênh thoại của bạn'),
    async execute(interaction) {
        const member = interaction.member;
        if (!member.voice.channel) {
            return interaction.reply({ content: 'Bạn cần tham gia một kênh thoại trước!', ephemeral: true });
        }

        const connection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        });

        // Initialize config cho guild này nếu chưa có
        getConfig(interaction.guild.id);

        await interaction.reply(`Đã tham gia kênh thoại **${member.voice.channel.name}**. Sẵn sàng đọc tin nhắn! (Quyền: everyone)`);
    }
};
