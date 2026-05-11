const axios = require('axios');
const { applyProsody } = require('./prosodyProcessor');

// Giọng đọc duy nhất — cảm xúc thể hiện qua speed + dấu câu
const SINGLE_VOICE = 'banmai'; // Ban Mai - Nữ miền Bắc

/**
 * Poll URL cho đến khi sẵn sàng (500ms/lần, tối đa 6 lần)
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
 * Gọi FPT.AI TTS — 1 giọng duy nhất, nhấn nhá qua prosody
 * @param {string} text     - Văn bản cần đọc
 * @param {string} language - Mã ngôn ngữ (hiện tại chưa dùng)
 * @param {string} emotion  - angry | excited | sad | question | sarcasm | neutral
 * @returns {Promise<Stream>}
 */
async function generateAudioStream(text, language = 'vi-VN', emotion = 'neutral') {
    // Áp dụng nhấn nhá theo cảm xúc → trả về text đã xử lý + speed
    const { processedText, speed } = applyProsody(text, emotion);

    console.log(`[TTS] Cảm xúc: ${emotion} | Speed: ${speed}`);
    console.log(`[TTS] Gốc: "${text}"`);
    console.log(`[TTS] Xử lý: "${processedText}"`);

    // Bước 1: Gửi text tới FPT.AI
    const ttsResponse = await axios({
        method: 'POST',
        url: 'https://api.fpt.ai/hmi/tts/v5',
        headers: {
            'api-key': process.env.FPT_API_KEY,
            'voice': SINGLE_VOICE,
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

    // Bước 2: Chờ URL sẵn sàng
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

module.exports = { generateAudioStream };
