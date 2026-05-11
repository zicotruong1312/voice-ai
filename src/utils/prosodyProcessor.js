/**
 * Bộ xử lý ngữ điệu tiếng Việt — Thêm nhấn nhá tự nhiên vào văn bản TTS
 * Các kỹ thuật:
 *  1. Thêm dấu phẩy sau liên từ, trạng từ đầu câu
 *  2. Tách câu dài tại điểm nối tự nhiên
 *  3. Xác định tốc độ đọc theo loại câu (hỏi, cảm thán, bình thường)
 *  4. Giãn cách từ quan trọng bằng dấu "..." để tạo khoảng dừng
 */

// Liên từ/trạng từ cần thêm dấu phẩy sau khi đứng đầu mệnh đề
const CONJUNCTION_PAUSE = [
    'và', 'nhưng', 'mà', 'còn', 'hoặc', 'hay', 'nên', 'vì',
    'bởi vì', 'cho nên', 'tuy nhiên', 'tuy vậy', 'thế nhưng',
    'rồi', 'thì', 'vậy', 'vậy thì', 'nào', 'ấy vậy mà'
];

// Từ chuyển tiếp cần dừng nhẹ sau
const TRANSITION_WORDS = [
    'ừ', 'ờ', 'ồ', 'ôi', 'ơi', 'à', 'ạ', 'ư', 'thôi',
    'được rồi', 'oke', 'okay', 'ừm', 'ừa', 'chào', 'hello', 'hi'
];

// Từ nhấn mạnh — thêm khoảng dừng trước
const EMPHASIS_WORDS = [
    'rất', 'quá', 'cực', 'siêu', 'tuyệt', 'kinh khủng',
    'không bao giờ', 'không thể', 'nhất định', 'chắc chắn',
    'thật ra', 'thật sự', 'thực sự', 'thực ra', 'thực tế'
];

/**
 * Xác định tốc độ đọc theo loại câu
 * @param {string} text
 * @returns {string} speed value cho FPT.AI (-3 đến 3)
 */
function detectSpeed(text, style) {
    if (style === 'angry') return '2';          // Cáu → nhanh, gấp
    if (text.endsWith('?')) return '-1';        // Hỏi → chậm, rõ ràng
    if (text.endsWith('!')) return '1';         // Cảm thán → nhanh, hứng khởi
    if (text.endsWith('...')) return '-1';      // Lửng lơ → chậm, kéo dài
    return '0';                                 // Bình thường
}

/**
 * Thêm dấu phẩy tự nhiên sau liên từ đứng giữa câu
 * VD: "tôi thích ăn và uống" → "tôi thích ăn, và uống"
 */
function addConjunctionPauses(text) {
    // Thêm dấu phẩy trước liên từ nếu đứng giữa câu (không phải đầu câu)
    for (const conj of CONJUNCTION_PAUSE) {
        // Chỉ thêm phẩy nếu trước liên từ có chữ (không phải đầu câu)
        const regex = new RegExp(`([a-zA-ZÀ-ỹ\\d])\\s+(${conj})\\s+`, 'gi');
        text = text.replace(regex, `$1, ${conj} `);
    }
    return text;
}

/**
 * Thêm dừng sau từ chuyển tiếp đứng đầu
 * VD: "ừ tôi hiểu rồi" → "ừ... tôi hiểu rồi"
 */
function addTransitionPauses(text) {
    for (const word of TRANSITION_WORDS) {
        const regex = new RegExp(`^(${word})\\s+`, 'i');
        text = text.replace(regex, `$1... `);

        // Cũng xử lý khi xuất hiện sau dấu câu
        const midRegex = new RegExp(`([.!?,])\\s*(${word})\\s+`, 'gi');
        text = text.replace(midRegex, `$1 $2... `);
    }
    return text;
}

/**
 * Thêm khoảng dừng trước từ nhấn mạnh
 * VD: "anh ấy rất giỏi" → "anh ấy... rất giỏi"
 */
function addEmphasisPauses(text) {
    for (const word of EMPHASIS_WORDS) {
        const regex = new RegExp(`\\s+(${word})\\s+`, 'gi');
        text = text.replace(regex, ` ... $1 `);
    }
    return text;
}

/**
 * Tách câu dài tại điểm nối tự nhiên (nếu > 80 ký tự)
 * để đọc từng đoạn nghe tự nhiên hơn
 */
function normalizeSpacing(text) {
    // Xóa nhiều dấu phẩy liên tiếp
    text = text.replace(/,\s*,+/g, ',');
    // Xóa dấu phẩy trước dấu chấm
    text = text.replace(/,\s*\./g, '.');
    // Xóa dấu "..." liên tiếp
    text = text.replace(/\.{4,}/g, '...');
    // Chuẩn hóa khoảng trắng
    text = text.replace(/\s{2,}/g, ' ').trim();
    return text;
}

/**
 * Hàm chính — xử lý văn bản để có ngữ điệu tự nhiên
 * @param {string} text - Văn bản gốc
 * @param {string} style - 'general' | 'angry'
 * @returns {{ processedText: string, speed: string }}
 */
function applyProsody(text, style = 'general') {
    let processed = text;

    // Bước 1: Thêm dừng sau từ chuyển tiếp
    processed = addTransitionPauses(processed);

    // Bước 2: Thêm dấu phẩy sau liên từ giữa câu
    processed = addConjunctionPauses(processed);

    // Bước 3: Thêm nhấn mạnh trước từ quan trọng
    processed = addEmphasisPauses(processed);

    // Bước 4: Chuẩn hóa dấu câu
    processed = normalizeSpacing(processed);

    // Bước 5: Xác định tốc độ
    const speed = detectSpeed(text, style); // Dùng text gốc để detect

    return { processedText: processed, speed };
}

module.exports = { applyProsody };
