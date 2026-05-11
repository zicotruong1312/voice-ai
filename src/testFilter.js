const { formatProfanity } = require('./utils/profanityFilter');

const testCases = [
    "Djtme mày đi đâu đấy",
    "cái lz này",
    "ngủ ngon nhé", // no bad word
    "mày ngu như bò vkl",
    "vcl con game này",
    "clgt sao chết rồi"
];

testCases.forEach(tc => {
    const result = formatProfanity(tc);
    console.log(`Original: ${tc}`);
    console.log(`Formatted: ${result.formattedText}`);
    console.log(`Style (Cảm xúc): ${result.style}`);
    console.log('-------------------------');
});
