const badwords = require('../config/badwords');

/**
 * Hàm phân tích văn bản và bọc các từ tục tĩu bằng UPPERCASE và thêm dấu chấm than cho ElevenLabs.
 * Phát hiện từ tục sẽ thay đổi style tổng thể thành angry (cáu gắt).
 * 
 * @param {string} text - Văn bản gốc từ Discord
 * @returns {{ formattedText: string, style: string }} - Object chứa Text đã xử lý và Cảm xúc
 */
function formatProfanity(text) {
    if (!text) return { formattedText: text, style: 'general' };
    
    let formattedText = text;
    let hasProfanity = false;
    
    // Xử lý bằng regex Patterns
    for (const pattern of badwords.regexPatterns) {
        formattedText = formattedText.replace(pattern, (match) => {
            hasProfanity = true;
            return match.toUpperCase();
        });
    }

    // Xử lý bằng plain words
    for (const word of badwords.plainBadWords) {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
        formattedText = formattedText.replace(wordRegex, (match) => {
            hasProfanity = true;
            return match.toUpperCase();
        });
    }
    
    // Nếu có từ tục tĩu, ElevenLabs sẽ bộc lộ cảm xúc gắt hơn nếu có dấu chấm than ở cuối câu
    if (hasProfanity) {
        if (!formattedText.endsWith('!') && !formattedText.endsWith('?')) {
            formattedText += '!!!';
        }
    }
    
    const finalStyle = hasProfanity ? 'angry' : 'general';
    
    return { formattedText, style: finalStyle };
}

module.exports = {
    formatProfanity
};
