// Các pattern và danh sách từ cần được nhấn mạnh khi đọc bằng Azure TTS
module.exports = {
    // Các từ ngữ rõ ràng
    plainBadWords: [
        "đĩ", "đếm", "lồn", "cặc", "buồi", "địt", "mẹ", "cha", "chó", "ngu", "đần", "cứtt",
        "phò", "bitch", "fuck", "shit"
    ],
    
    // Các mẫu Regular Expression để bắt các biến thể của từ ngữ, teencode, viết tắt
    // Sử dụng \b để giới hạn từ (nếu cần) hoặc không để bắt các cụm từ dính liền.
    regexPatterns: [
        /địt\s*mẹ/gi,
        /đ[iị]t\s*m[eẹ]/gi,
        /d[ji]tm[ea]/gi, // Djtme, ditme
        /đmm/gi,
        /đcm/gi,
        /vcl/gi,
        /vkl/gi,
        /vl/gi,
        /clgt/gi,
        /c[aá]i\s*l[ồo]n/gi, // cái lồn, cái lon
        /c[aá]i\s*lz/gi, // cái lz
        /l[ồo]n/gi,
        /lz/gi,
        /c[ặa]c/gi,
        /b[uù]ồi/gi,
        /cc/gi,
        /cmm/gi,
        /đĩ/gi,
        /ph[òo]/gi,
        /như\s*cứt/gi,
        /như\s*cc/gi,
        /như\s*cặc/gi,
        /ngu\b/gi, // chỉ bắt chữ ngu, không bắt chữ ngủ (bằng word boundary và regex chính xác)
        /óc\s*chó/gi
    ]
};
