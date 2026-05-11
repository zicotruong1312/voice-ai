const axios = require('axios');
const { applyProsody } = require('./prosodyProcessor');

// FPT.AI Voice IDs
// angry/excited → leminh (Nam - khỏe, dứt khoát)
// sad/neutral   → banmai (Nữ - mềm mại)
// question      → banmai
// sarcasm       → leminh
const VOICE_MAP = {
    'vi-VN': 'banmai',
    'en-US': 'leminh',
    'ja-JP': 'banmai',
    'ko-KR': 'banmai'
};

const EMOTION_VOICE = {
    angry:    'leminh',
    excited:  'leminh',
    sad:      'banmai',
    question: 'banmai',
    sarcasm:  'leminh',
    neutral:  'banmai'
};

/**
 * Poll URL cho đến khi sẵn sàng — bắt đầu nhanh (500ms), tối đa 6 lần
 */
async function waitForAudioUrl(url, maxRetries = 6, delayMs = 500) {
    for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        try {
            const res = await axios.head(url, { timeout: 3000 });
            if (res.status === 200) {
                console.log(`[TTS] URL sẵn sàng sau ${(i + 1) * delayMs}ms`);
                return true;
            }
        } catch (e) {
            // Chưa sẵn sàng, thử lại
        }
    }
    console.log(`[TTS] Hết retry, thử stream thẳng...`);
    return false;
}

/**
 * Gọi API FPT.AI để tạo audio stream với ngữ điệu tự nhiên
 * @param {string} text - Văn bản cần đọc
 * @param {string} language - Mã ngôn ngữ
 * @param {string} emotion - Cảm xúc (angry, excited, sad, question, sarcasm, neutral)
 * @returns {Promise<Stream>}
 */
async function generateAudioStream(text, language = 'vi-VN', emotion = 'neutral') {
    // Chọn giọng theo cảm xúc + ngôn ngữ
    const langVoice = VOICE_MAP[language] || VOICE_MAP['vi-VN'];
    const voice = language === 'vi-VN'
        ? (EMOTION_VOICE[emotion] || 'banmai')
        : langVoice;

    // Áp dụng thuật toán nhấn nhá theo cảm xúc
    const { processedText, speed } = applyProsody(text, emotion);
    console.log(`[TTS] Cảm xúc: ${emotion} | Giọng: ${voice} | Speed: ${speed}`);
    console.log(`[TTS] Gốc: "${text}"`);
    console.log(`[TTS] Sau xử lý: "${processedText}"`);

    // Bước 1: Gửi text tới FPT.AI
    const ttsResponse = await axios({
        method: 'POST',
        url: 'https://api.fpt.ai/hmi/tts/v5',
        headers: {
            'api-key': process.env.FPT_API_KEY,
            'voice': voice,
            'speed': speed,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: processedText,
        timeout: 10000
    });

    if (ttsResponse.data.error !== 0) {
        throw new Error(`FPT.AI TTS Error: ${ttsResponse.data.message}`);
    }

    const audioUrl = ttsResponse.data.async;
    console.log(`[TTS] Nhận URL: ${audioUrl}`);

    // Bước 2: Poll URL cho đến khi sẵn sàng
    await waitForAudioUrl(audioUrl);

    // Bước 3: Stream audio về
    const audioResponse = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream',
        timeout: 10000
    });

    console.log(`[TTS] Bắt đầu phát...`);
    return audioResponse.data;
}

module.exports = {
    generateAudioStream,
    VOICE_MAP
};
