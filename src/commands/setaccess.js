const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { updateConfig } = require('../config/guildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setaccess')
        .setDescription('Thiết lập người/role được quyền sử dụng bot để đọc tin nhắn')
        .addMentionableOption(option => 
            option.setName('target')
                .setDescription('User hoặc Role được phép (để trống để reset về everyone)')
                .setRequired(false)
        )
        // Yêu cầu quyền Manage Channels (hoặc Administrator có sẵn)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
    async execute(interaction) {
        const target = interaction.options.getMentionable('target');
        
        if (!target) {
            updateConfig(interaction.guild.id, 'allowed', 'everyone');
            return interaction.reply('Đã reset quyền truy cập. **Tất cả mọi người** hiện có thể dùng bot.');
        }

        updateConfig(interaction.guild.id, 'allowed', target.id);
        
        let type = target.user ? 'Người dùng' : 'Role';
        await interaction.reply(`Đã giới hạn quyền truy cập. Chỉ ${type} **${target.user ? target.user.tag : target.name}** mới có thể ra lệnh bot đọc.`);
    }
};
