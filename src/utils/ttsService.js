const axios = require('axios');

// FPT.AI Voice IDs
const VOICE_MAP = {
    'vi-VN': 'banmai',     // Ban Mai - Nữ miền Bắc (Most Popular)
    'en-US': 'leminh',
    'ja-JP': 'banmai',
    'ko-KR': 'banmai'
};

/**
 * Chờ cho tới khi URL audio từ FPT.AI sẵn sàng (polling)
 */
async function waitForAudioUrl(url, maxRetries = 5, delayMs = 1500) {
    for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        try {
            const res = await axios.head(url, { timeout: 5000 });
            if (res.status === 200) {
                console.log(`[TTS] Audio URL sẵn sàng sau ${i + 1} lần thử.`);
                return true;
            }
        } catch (e) {
            console.log(`[TTS] Thử lần ${i + 1}/${maxRetries}: URL chưa sẵn sàng...`);
        }
    }
    return false; // Cho qua dù timeout, thử tải luôn
}

/**
 * Gọi API FPT.AI để tạo audio stream
 * @param {string} text - Văn bản cần đọc
 * @param {string} language - Mã ngôn ngữ
 * @param {string} style - Cảm xúc (angry, general)
 * @returns {Promise<Stream>}
 */
async function generateAudioStream(text, language = 'vi-VN', style = 'general') {
    const voice = VOICE_MAP[language] || VOICE_MAP['vi-VN'];
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
        data: text,
        timeout: 10000
    });

    if (ttsResponse.data.error !== 0) {
        throw new Error(`FPT.AI TTS Error: ${ttsResponse.data.message}`);
    }

    const audioUrl = ttsResponse.data.async;
    console.log(`[TTS] FPT.AI audio URL nhận được: ${audioUrl}`);

    // Bước 2: Chờ cho URL sẵn sàng
    await waitForAudioUrl(audioUrl);

    // Bước 3: Tải audio về dưới dạng stream
    const audioResponse = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream',
        timeout: 10000
    });

    console.log(`[TTS] Stream audio đã sẵn sàng, bắt đầu phát...`);
    return audioResponse.data;
}

module.exports = {
    generateAudioStream,
    VOICE_MAP
};
