const { getVoiceConnection } = require('@discordjs/voice');
const { getConfig } = require('../config/guildConfig');
const { formatProfanity } = require('../utils/profanityFilter');
const { addToQueue } = require('../utils/audioQueue');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Bỏ qua tin nhắn là lệnh (có bắt đầu bằng / sẽ được discord tự lo, nhưng với prefix thông thường thì nên bỏ)
        if (message.content.startsWith('/')) return;

        const connection = getVoiceConnection(message.guild.id);
        if (!connection) return; // Nếu bot không ở trong voice thì không đọc

        const config = getConfig(message.guild.id);

        // Kiểm tra quyền
        let isAllowed = false;
        if (config.allowed === 'everyone') {
            isAllowed = true;
        } else {
            // Kiểm tra xem config.allowed là role id hay user id
            if (message.author.id === config.allowed) {
                isAllowed = true; // Là user
            } else if (message.member.roles.cache.has(config.allowed)) {
                isAllowed = true; // Là role
            }
        }

        if (!isAllowed) return; // Không có quyền thì bỏ qua

        // Chỉ đọc text, không đọc ảnh, file
        if (!message.content) return;

        // Xử lý bộ lọc chửi tục
        const { formattedText, style } = formatProfanity(message.content);

        // Thêm vào hàng đợi TTS với ngôn ngữ và style cảm xúc
        await addToQueue(message.guild.id, formattedText, config.language, style);
    }
};
