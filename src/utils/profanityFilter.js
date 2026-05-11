const badwords = require('../config/badwords');
const { detectEmotion } = require('./emotionDetector');

/**
 * Phân tích văn bản — phát hiện từ cấm + xác định cảm xúc
 * Pipeline: text → badword check → emotion detect → format
 *
 * @param {string} text - Văn bản gốc từ Discord
 * @returns {{ formattedText: string, emotion: string }}
 */
function analyzeText(text) {
    if (!text) return { formattedText: text, emotion: 'neutral' };

    let formattedText = text;
    let hasProfanity = false;

    // ─── Kiểm tra regex patterns ────────────────────────────────────
    for (const pattern of badwords.regexPatterns) {
        formattedText = formattedText.replace(pattern, (match) => {
            hasProfanity = true;
            return match.toUpperCase(); // UPPERCASE để FPT.AI đọc nhấn mạnh
        });
    }

    // ─── Kiểm tra plain words ────────────────────────────────────────
    for (const word of badwords.plainBadWords) {
        const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
        formattedText = formattedText.replace(wordRegex, (match) => {
            hasProfanity = true;
            return match.toUpperCase();
        });
    }

    // ─── Thêm dấu chấm than nếu có từ tục (tạo giọng mạnh hơn) ────
    if (hasProfanity) {
        if (!formattedText.endsWith('!') && !formattedText.endsWith('?')) {
            formattedText += '!';
        }
    }

    // ─── Phát hiện cảm xúc ──────────────────────────────────────────
    const { emotion } = detectEmotion(text, hasProfanity);

    return { formattedText, emotion };
}

/** Escape ký tự đặc biệt trong regex */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { analyzeText };
