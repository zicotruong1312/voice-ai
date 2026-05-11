/**
 * =============================================
 * DANH SÁCH TỪ CẤM TIẾNG VIỆT — VoiceAI Bot
 * Bao gồm: từ rõ ràng, teencode, viết tắt,
 * biến thể ký tự, leet speak tiếng Việt
 * =============================================
 */
module.exports = {

    // ─── TỪ RÕ RÀNG ────────────────────────────────────────────────
    plainBadWords: [
        // Chửi bố mẹ
        'đm', 'đmm', 'đmmt', 'đcm', 'địt mẹ', 'đít mẹ',
        // Bộ phận sinh dục
        'lồn', 'lon', 'cặc', 'buồi', 'buoi', 'cac', 'loz',
        'đĩ', 'phò', 'cave', 'điếm',
        // Chửi chung
        'ngu', 'ngu vl', 'óc chó', 'óc lợn', 'đần', 'đần độn',
        'khốn nạn', 'mẹ kiếp', 'chó chết', 'đồ chó', 'thằng chó',
        'con chó', 'đồ điên', 'thần kinh', 'mất dạy',
        'vô học', 'cút', 'cút đi', 'xéo', 'xéo đi',
        // Tiếng Anh
        'fuck', 'fucking', 'shit', 'bitch', 'bastard',
        'asshole', 'cunt', 'dick', 'pussy', 'whore',
        'motherfucker', 'wtf', 'stfu'
    ],

    // ─── REGEX PATTERNS — TEENCODE & BIẾN THỂ ──────────────────────
    regexPatterns: [

        // === ĐỊT MẸ và biến thể ===
        /đ[iị́]t\s*m[eẹ]/gi,
        /d[jJ1i][tT]\s*m[eEaA3]/gi,    // djtme, ditme, d1tme
        /đ\.m+/gi,                       // đ.m, đ.mm
        /đ_m+/gi,
        /đm+t?/gi,                       // đm, đmm, đmmt
        /đcm+/gi,

        // === LỒN và biến thể ===
        /l[o0ồôõóò][n]/gi,               // lồn, lon, l0n
        /l[zZ2]/gi,                       // lz, lZ
        /c[áa]\s*l[ồo0n]/gi,             // cái lồn, cái lon
        /c[áa]\s*l[zZ2]/gi,              // cái lz

        // === CẶC và biến thể ===
        /c[ặa4][ck]/gi,                  // cặc, cac, c4c
        /c+c+/gi,                        // cc, ccc

        // === BUỒI và biến thể ===
        /b[uùú][oồ0][i1]/gi,            // buồi, bu0i
        /b[uù][ô0]i/gi,

        // === ĐĨ / PHÒ ===
        /đ[iĩỉị]\b/gi,
        /ph[oòó]\b/gi,
        /c[aâ][vV][eE]\b/gi,             // cave
        /đi[eê]m\b/gi,                   // điếm

        // === NGU và biến thể ===
        /\bng+u+\b/gi,                   // ngu, nguu
        /\bóc\s*chó\b/gi,
        /\bóc\s*l[ợo]n\b/gi,
        /\bđ[aầ]n\s*đ[oộ]n\b/gi,

        // === KHỐN NẠN / MẤT DẠY ===
        /kh[oố]n\s*n[aạ]n/gi,
        /m[aấ]t\s*d[aạ]y/gi,
        /v[oô]\s*h[oọ]c/gi,

        // === TIẾNG ANH ===
        /\bf[u*@][c*@][k*@]/gi,          // fuck, f*ck, f@ck
        /\bsh[i1][t7]\b/gi,             // shit, sh1t
        /\bb[i1][t7]ch\b/gi,            // bitch, b1tch
        /\bd[i1][c*]k\b/gi,             // dick, d1ck
        /\bwh[o0]re\b/gi,               // whore
        /\bcunt\b/gi,
        /\bass\s*h[o0]le\b/gi,

        // === VIẾT TẮT PHỔ BIẾN ===
        /\bvcl\b/gi,
        /\bvkl\b/gi,
        /\b(vl|VL)\b/g,
        /\bclgt\b/gi,
        /\bwtf\b/gi,
        /\bstfu\b/gi,
        /\bknn\b/gi,                     // khốn nạn nhé
        /\bđkm\b/gi,
        /\bcmm\b/gi
    ]
};
