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

        console.log(`[DEBUG] Nhận được tin nhắn từ ${message.author.tag}: "${message.content}"`);

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

        // Loại bỏ các URL và lấy nội dung sạch (không chứa ID Discord dạng <@123>)
        let cleanText = message.cleanContent.replace(/https?:\/\/[^\s]+/g, '').trim();

        // Không đọc nếu tin nhắn chỉ có URL (thành chuỗi rỗng) hoặc quá dài (>200 ký tự)
        if (!cleanText || cleanText.length > 200) {
            console.log(`[DEBUG] Bỏ qua vì tin nhắn rỗng sau khi lọc hoặc quá dài.`);
            return;
        }

        // Xử lý bộ lọc chửi tục
        const { formattedText, style } = formatProfanity(cleanText);
        
        // Thêm tên người nói vào đầu câu
        const textToRead = `${message.member.displayName} nói, ${formattedText}`;
        
        console.log(`[DEBUG] Đã format xong: ${textToRead} | Style: ${style}`);

        // Thêm vào hàng đợi TTS với ngôn ngữ và style cảm xúc
        await addToQueue(message.guild.id, textToRead, config.language, style);
        console.log(`[DEBUG] Đã đẩy vào Queue thành công.`);
    }
};
