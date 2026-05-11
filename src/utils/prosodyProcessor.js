/**
 * =============================================
 * BỘ XỬ LÝ NGỮ ĐIỆU TIẾNG VIỆT — VoiceAI Bot
 *
 * Nhấn nhá + thần thái theo từng cảm xúc:
 *   angry    → nhanh, gấp, ngắt quãng mạnh
 *   excited  → nhanh, vui, nhấn từ quan trọng
 *   sad      → chậm, kéo dài, nhiều khoảng dừng
 *   question → chậm, rõ ràng, lên giọng cuối
 *   sarcasm  → bình thường, dừng trước từ mỉa mai
 *   neutral  → tự nhiên, dừng tại liên từ
 * =============================================
 */

// ─── TỪ KHÓA THEO CẢM XÚC ──────────────────────────────────────────

const CONJUNCTION_LIST = [
    'và', 'nhưng', 'mà', 'còn', 'hoặc', 'hay', 'nên', 'vì',
    'bởi vì', 'cho nên', 'tuy nhiên', 'tuy vậy', 'thế nhưng',
    'rồi', 'thì', 'vậy', 'vậy thì', 'ấy vậy mà', 'chứ'
];

const TRANSITION_LIST = [
    'ừ', 'ờ', 'ồ', 'ôi', 'ơi', 'à', 'ạ', 'ư', 'thôi',
    'được rồi', 'oke', 'okay', 'ừm', 'ừa', 'chào', 'hello', 'hi',
    'này', 'nghe này', 'này nha', 'thế này', 'thế thì'
];

const EMPHASIS_LIST = [
    'rất', 'quá', 'cực kỳ', 'cực', 'siêu', 'vô cùng',
    'không bao giờ', 'không thể', 'nhất định', 'chắc chắn',
    'thật ra', 'thật sự', 'thực sự', 'thực ra', 'thực tế',
    'hoàn toàn', 'tuyệt đối', 'mãi mãi', 'bao giờ cũng'
];

// Từ cần đọc chậm lại (trước khi nói thông tin quan trọng)
const DRAMATIC_PAUSE_LIST = [
    'nhưng', 'tuy nhiên', 'thế nhưng', 'thật ra', 'thực ra',
    'bất ngờ', 'không ngờ', 'ai dè', 'hóa ra', 'té ra',
    'cuối cùng', 'rốt cuộc', 'sự thật là', 'thật sự là'
];

// ─── CÀI ĐẶT THEO CẢM XÚC ──────────────────────────────────────────

const EMOTION_CONFIG = {
    angry: {
        speed: '2',
        // Câu ngắn, gấp gáp → dùng dấu phẩy ít thôi, không thêm "..."
        pauseStyle: 'sharp',    // Dừng sắc, ngắn
        shortPause: ', ',
        longPause: '. '
    },
    excited: {
        speed: '1',
        pauseStyle: 'light',    // Dừng nhẹ, vui
        shortPause: ', ',
        longPause: '! '
    },
    sad: {
        speed: '-2',
        pauseStyle: 'heavy',    // Dừng nhiều, kéo dài
        shortPause: '... ',
        longPause: '... '
    },
    question: {
        speed: '-1',
        pauseStyle: 'clear',    // Rõ ràng, chậm rãi
        shortPause: ', ',
        longPause: ', '
    },
    sarcasm: {
        speed: '0',
        pauseStyle: 'ironic',   // Dừng trước từ mỉa mai
        shortPause: '... ',
        longPause: '... '
    },
    neutral: {
        speed: '0',
        pauseStyle: 'natural',
        shortPause: ', ',
        longPause: '. '
    }
};

// ─── CÁC HÀM XỬ LÝ ──────────────────────────────────────────────────

/** Thêm dừng sau từ chuyển tiếp đứng đầu câu hoặc sau dấu câu */
function applyTransitionPauses(text, config) {
    for (const word of TRANSITION_LIST) {
        // Đầu câu
        const startRegex = new RegExp(`^(${word})\\s+`, 'i');
        text = text.replace(startRegex, `$1${config.shortPause}`);
        // Sau dấu câu
        const midRegex = new RegExp(`([.!?,])\\s*(${word})\\s+`, 'gi');
        text = text.replace(midRegex, `$1 $2${config.shortPause}`);
    }
    return text;
}

/** Thêm dừng tự nhiên trước liên từ giữa câu */
function applyConjunctionPauses(text, config) {
    for (const conj of CONJUNCTION_LIST) {
        const regex = new RegExp(`([\\wÀ-ỹ])\\s+(${conj})\\s+`, 'gi');
        text = text.replace(regex, `$1${config.shortPause}$2 `);
    }
    return text;
}

/** Thêm kịch tính trước từ dramatic */
function applyDramaticPauses(text, config) {
    // Chỉ áp dụng cho emotion không phải angry (angry không cần dramatic)
    for (const word of DRAMATIC_PAUSE_LIST) {
        const regex = new RegExp(`\\s+(${word})\\s+`, 'gi');
        text = text.replace(regex, ` ${config.longPause}$1 `);
    }
    return text;
}

/** Nhấn mạnh từ quan trọng bằng dừng trước */
function applyEmphasisPauses(text, config) {
    for (const word of EMPHASIS_LIST) {
        const regex = new RegExp(`\\s+(${word})\\s+`, 'gi');
        text = text.replace(regex, ` ${config.shortPause}$1 `);
    }
    return text;
}

/** Chuẩn hóa dấu câu sau khi xử lý */
function normalize(text) {
    text = text.replace(/,\s*,+/g, ',');            // Nhiều dấu phẩy → 1
    text = text.replace(/,\s*\./g, '.');             // Phẩy trước chấm → bỏ phẩy
    text = text.replace(/\.{4,}/g, '...');           // Quá nhiều chấm → 3 chấm
    text = text.replace(/(\.\.\.\s*){2,}/g, '... '); // Nhiều "..." liên tiếp → 1
    text = text.replace(/\s{2,}/g, ' ').trim();      // Nhiều khoảng trắng → 1
    return text;
}

// ─── HÀM CHÍNH ───────────────────────────────────────────────────────

/**
 * Áp dụng nhấn nhá + thần thái theo cảm xúc
 * @param {string} text - Văn bản đã qua profanityFilter
 * @param {string} emotion - Cảm xúc từ emotionDetector
 * @returns {{ processedText: string, speed: string }}
 */
function applyProsody(text, emotion = 'neutral') {
    const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;
    let processed = text;

    if (emotion === 'angry') {
        // Angry: KHÔNG thêm nhiều dừng, chỉ giữ câu gấp gáp, tự nhiên
        processed = normalize(processed);
    } else if (emotion === 'sad') {
        // Sad: nhiều khoảng dừng, kéo dài
        processed = applyTransitionPauses(processed, config);
        processed = applyDramaticPauses(processed, config);
        processed = applyConjunctionPauses(processed, config);
        processed = normalize(processed);
    } else if (emotion === 'excited') {
        // Excited: nhấn từ quan trọng, ít dừng
        processed = applyTransitionPauses(processed, config);
        processed = applyEmphasisPauses(processed, config);
        processed = normalize(processed);
    } else if (emotion === 'question') {
        // Question: rõ ràng, thêm dừng trước từ hỏi
        processed = applyTransitionPauses(processed, config);
        processed = applyConjunctionPauses(processed, config);
        processed = normalize(processed);
    } else if (emotion === 'sarcasm') {
        // Sarcasm: dừng trước dramatic words tạo hiệu ứng mỉa mai
        processed = applyDramaticPauses(processed, config);
        processed = applyEmphasisPauses(processed, config);
        processed = normalize(processed);
    } else {
        // Neutral: tất cả nhấn nhá vừa phải
        processed = applyTransitionPauses(processed, config);
        processed = applyConjunctionPauses(processed, config);
        processed = applyEmphasisPauses(processed, config);
        processed = normalize(processed);
    }

    return { processedText: processed, speed: config.speed };
}

module.exports = { applyProsody };
