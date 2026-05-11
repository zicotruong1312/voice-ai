const axios = require('axios');

// ElevenLabs Voice IDs
// Bạn có thể đổi các ID này bằng ID giọng khác trong ElevenLabs Voice Library
const VOICE_MAP = {
    'vi-VN': 'EXAVITQu4vr4xnSDxMaL', // Bella (Ví dụ)
    'en-US': '21m00Tcm4TlvDq8ikWAM', // Rachel
    'ja-JP': '2EiwWnXFnvU5JabPnv8n', // Clyde
    'ko-KR': 'AZnzlk1XvdvUeBnXmlld'  // Domi
};

/**
 * Gọi API ElevenLabs để tạo audio stream
 * @param {string} text - Văn bản cần đọc
 * @param {string} language - Mã ngôn ngữ (dùng để chọn Voice ID tương ứng)
 * @param {string} style - Cảm xúc (angry, general). ElevenLabs tự nhận diện qua dấu câu và in hoa.
 * @returns {Promise<PassThrough>}
 */
function generateAudioStream(text, language = 'vi-VN', style = 'general') {
    return new Promise(async (resolve, reject) => {
        try {
            const voiceId = VOICE_MAP[language] || VOICE_MAP['vi-VN'];
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
            
            // Nếu style là angry, đảm bảo text có tính chất mạnh (đã xử lý bên profanityFilter)
            
            const response = await axios({
                method: 'POST',
                url: url,
                data: {
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: style === 'angry' ? 0.3 : 0.5, // Giảm stability để giọng linh hoạt/cảm xúc hơn khi cáu gắt
                        similarity_boost: 0.75,
                        style: style === 'angry' ? 0.5 : 0.0, // Một số giọng hỗ trợ tham số style boost
                        use_speaker_boost: true
                    }
                },
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            // response.data là một stream trực tiếp từ axios
            resolve(response.data);
        } catch (error) {
            console.error("ElevenLabs API Error:", error.response?.data || error.message);
            reject(error);
        }
    });
}

module.exports = {
    generateAudioStream,
    VOICE_MAP
};
