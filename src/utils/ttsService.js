const axios = require('axios');

// FPT.AI Voice IDs
// Docs: https://docs.fpt.ai/docs/en/tts/api-reference
const VOICE_MAP = {
    'vi-VN': 'banmai',     // Ban Mai - Nữ miền Bắc (Most Popular)
    'en-US': 'leminh',    // FPT.AI chủ yếu hỗ trợ tiếng Việt
    'ja-JP': 'banmai',    // fallback
    'ko-KR': 'banmai'     // fallback
};

// Danh sách giọng đọc có thể dùng:
// banmai   - Nữ miền Bắc (phổ biến nhất)
// leminh   - Nam miền Bắc
// thuminh  - Nữ miền Bắc
// myan     - Nữ miền Trung
// giahuy   - Nam miền Trung
// ngoclan  - Nữ miền Trung
// linhsan  - Nữ miền Nam
// lannhi   - Nữ miền Nam
// minhquang - Nam miền Bắc

/**
 * Gọi API FPT.AI để tạo audio stream
 * @param {string} text - Văn bản cần đọc
 * @param {string} language - Mã ngôn ngữ (dùng để chọn Voice tương ứng)
 * @param {string} style - Cảm xúc (angry, general)
 * @returns {Promise<Stream>}
 */
async function generateAudioStream(text, language = 'vi-VN', style = 'general') {
    const voice = VOICE_MAP[language] || VOICE_MAP['vi-VN'];

    // FPT.AI speed: -3 (chậm nhất) đến 3 (nhanh nhất), 0 = bình thường
    const speed = style === 'angry' ? '1' : '0';

    // Bước 1: Gửi text tới FPT.AI, nhận về URL audio
    const ttsResponse = await axios({
        method: 'POST',
        url: 'https://api.fpt.ai/hmi/tts/v5',
        headers: {
            'api-key': process.env.FPT_API_KEY,
            'voice': voice,
            'speed': speed,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: text
    });

    if (ttsResponse.data.error !== 0) {
        throw new Error(`FPT.AI TTS Error: ${ttsResponse.data.message}`);
    }

    const audioUrl = ttsResponse.data.async;
    console.log(`[TTS] FPT.AI audio URL: ${audioUrl}`);

    // Bước 2: Chờ 1 giây rồi tải audio về dưới dạng stream
    await new Promise(resolve => setTimeout(resolve, 1000));

    const audioResponse = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream'
    });

    return audioResponse.data;
}

module.exports = {
    generateAudioStream,
    VOICE_MAP
};
