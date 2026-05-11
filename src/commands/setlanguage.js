const { SlashCommandBuilder } = require('discord.js');
const { updateConfig } = require('../config/guildConfig');
const { VOICE_MAP } = require('../utils/ttsService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlanguage')
        .setDescription('Thay đổi ngôn ngữ / giọng đọc của bot')
        .addStringOption(option => 
            option.setName('lang')
                .setDescription('Mã ngôn ngữ')
                .setRequired(true)
                .addChoices(
                    { name: 'Tiếng Việt (Mặc định)', value: 'vi-VN' },
                    { name: 'Tiếng Anh (Mỹ)', value: 'en-US' },
                    { name: 'Tiếng Nhật', value: 'ja-JP' },
                    { name: 'Tiếng Hàn', value: 'ko-KR' }
                )
        ),
    async execute(interaction) {
        const lang = interaction.options.getString('lang');
        updateConfig(interaction.guild.id, 'language', lang);

        await interaction.reply(`Đã thay đổi giọng đọc thành **${lang}** (${VOICE_MAP[lang]}).`);
    }
};
