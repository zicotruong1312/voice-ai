/**
 * =============================================
 * BỘ PHÁT HIỆN CẢM XÚC TIẾNG VIỆT — VoiceAI Bot
 *
 * Phát hiện 6 cảm xúc chính từ nội dung tin nhắn:
 *   angry    — tức giận, cáu bẳn
 *   excited  — hứng khởi, phấn khích
 *   sad      — buồn bã, thở dài
 *   question — thắc mắc, hỏi han
 *   sarcasm  — mỉa mai, châm biếm
 *   neutral  — bình thường
 * =============================================
 */

// ─── TỪ KHÓA THEO CẢM XÚC ──────────────────────────────────────────

const EMOTION_KEYWORDS = {

    angry: {
        weight: 10,
        words: [
            'tức', 'tức quá', 'tức vl', 'bực', 'bực mình', 'điên', 'điên tiết',
            'chán', 'chán vl', 'ghét', 'ghét thật', 'bực bội', 'cáu',
            'tao', 'mày', 'đéo', 'không thể chịu', 'thôi kệ', 'mặc kệ',
            'thật sự tức', 'quá bực', 'hết chịu nổi', 'chịu không nổi',
            'sao cứ', 'sao lại', 'làm cái gì', 'muốn điên'
        ],
        // Dấu hiệu bổ sung
        signals: {
            capsRatio: 0.4,         // > 40% chữ hoa → tức giận
            exclamationCount: 2,    // ≥ 2 dấu ! → tức giận
        }
    },

    excited: {
        weight: 8,
        words: [
            'yayyy', 'yay', 'wow', 'ồ', 'ôi trời', 'trời ơi', 'quá đỉnh',
            'đỉnh quá', 'tuyệt quá', 'thích quá', 'vui quá', 'haha', 'hehe',
            'lol', 'lmao', 'ghê', 'ghê thật', 'thật không', 'không thể tin',
            'awesome', 'nice', 'đỉnh của đỉnh', 'quá xịn', 'xịn quá',
            'hay quá', 'hay vl', 'pro quá', 'ok boomer', 'gg', 'ez',
            'gét gô', 'get go', 'bắt đầu thôi', 'go go', 'đi thôi'
        ],
        signals: {
            exclamationCount: 1,
        }
    },

    sad: {
        weight: 8,
        words: [
            'buồn', 'buồn quá', 'tội', 'tội quá', 'thương', 'thương quá',
            'nhớ', 'nhớ quá', 'cô đơn', 'một mình', 'chán', 'chán đời',
            'mệt', 'mệt quá', 'không muốn', 'không thiết', 'thôi thôi',
            'kệ đi', 'thôi bỏ', 'thua rồi', 'thất bại', 'không được',
            'hu hu', 'huhu', 'khóc', 'cry', ':((', 'T_T', ':\'(',
            'đau', 'đau quá', 'tiếc', 'tiếc quá', 'ước gì', 'giá mà'
        ],
        signals: {
            ellipsisCount: 1,       // Có dấu "..." → tâm trạng nặng
        }
    },

    question: {
        weight: 6,
        words: [
            'sao', 'tại sao', 'vì sao', 'như thế nào', 'thế nào', 'làm sao',
            'bao giờ', 'khi nào', 'ở đâu', 'cái gì', 'gì vậy', 'thế nào vậy',
            'có không', 'được không', 'có đúng không', 'thật không', 'hả',
            'hả vậy', 'thế à', 'vậy hả', 'ừ thì', 'thì sao', 'rồi sao',
            'ai', 'ai vậy', 'chơi không', 'biết không', 'hiểu không'
        ],
        signals: {
            questionMark: true,     // Có dấu ? → câu hỏi
        }
    },

    sarcasm: {
        weight: 7,
        words: [
            'ừ ừ', 'ừ nhỉ', 'thật sự á', 'thật vậy á', 'wow ghê',
            'giỏi thật', 'giỏi vậy', 'hay đấy', 'hay thật', 'tài thật',
            'tưởng đâu', 'tưởng là', 'ai dè', 'ngờ đâu', 'mà thôi',
            'chắc rồi', 'dĩ nhiên', 'dĩ nhiên rồi', 'hiển nhiên',
            'ừ mà', 'ừ thôi', 'ừ kệ', 'ừ ừ đúng rồi',
            'chắc chắn rồi', 'rõ ràng rồi', 'đương nhiên'
        ]
    }
};

// ─── HÀM PHÁT HIỆN CẢM XÚC ──────────────────────────────────────────

/**
 * Phân tích văn bản và trả về cảm xúc chính
 * @param {string} text - Văn bản gốc
 * @param {boolean} hasProfanity - Có từ tục không (từ profanityFilter)
 * @returns {{ emotion: string, confidence: number }}
 */
function detectEmotion(text, hasProfanity = false) {
    if (!text) return { emotion: 'neutral', confidence: 0 };

    // Nếu có từ tục → mặc định angry (ưu tiên cao nhất)
    if (hasProfanity) return { emotion: 'angry', confidence: 100 };

    const lower = text.toLowerCase();
    const scores = {};

    // ─── Tính điểm cho từng cảm xúc ───────────────────────────────
    for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
        let score = 0;

        // Điểm theo từ khóa
        for (const word of data.words) {
            if (lower.includes(word)) {
                score += data.weight;
            }
        }

        // Điểm theo tín hiệu đặc biệt
        if (data.signals) {
            // Tỷ lệ chữ hoa (angry)
            if (data.signals.capsRatio !== undefined) {
                const upperCount = (text.match(/[A-ZÀ-Ỵ]/g) || []).length;
                const ratio = upperCount / text.length;
                if (ratio >= data.signals.capsRatio) score += 15;
            }
            // Số dấu chấm than (angry/excited)
            if (data.signals.exclamationCount !== undefined) {
                const excCount = (text.match(/!/g) || []).length;
                if (excCount >= data.signals.exclamationCount) score += 10;
            }
            // Dấu "..." (sad)
            if (data.signals.ellipsisCount !== undefined) {
                if (text.includes('...')) score += 8;
            }
            // Dấu ? (question)
            if (data.signals.questionMark && text.includes('?')) {
                score += 12;
            }
        }

        if (score > 0) scores[emotion] = score;
    }

    // ─── Chọn cảm xúc có điểm cao nhất ───────────────────────────
    if (Object.keys(scores).length === 0) {
        return { emotion: 'neutral', confidence: 0 };
    }

    const topEmotion = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return {
        emotion: topEmotion[0],
        confidence: topEmotion[1]
    };
}

module.exports = { detectEmotion, EMOTION_KEYWORDS };
