const { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { Collection } = require('discord.js');
const { generateAudioStream } = require('./ttsService');

// Map để quản lý AudioPlayer và Queue cho từng server
const queues = new Collection();

function getGuildQueue(guildId) {
    if (!queues.has(guildId)) {
        const player = createAudioPlayer();
        queues.set(guildId, {
            player: player,
            items: [],
            isPlaying: false
        });

        player.on(AudioPlayerStatus.Idle, () => {
            const queue = queues.get(guildId);
            queue.isPlaying = false;
            playNext(guildId); // Chơi bài tiếp theo nếu có
        });

        player.on('error', error => {
            console.error('AudioPlayer Error:', error.message);
            const queue = queues.get(guildId);
            queue.isPlaying = false;
            playNext(guildId);
        });
    }
    return queues.get(guildId);
}

async function addToQueue(guildId, text, language, style = 'general') {
    const queue = getGuildQueue(guildId);
    queue.items.push({ text, language, style });
    
    if (!queue.isPlaying) {
        playNext(guildId);
    }
}

async function playNext(guildId) {
    const queue = getGuildQueue(guildId);
    if (queue.items.length === 0) return;

    const connection = getVoiceConnection(guildId);
    if (!connection) {
        // Nếu không có connection thì xóa queue
        queue.items = [];
        queue.isPlaying = false;
        return;
    }

    queue.isPlaying = true;
    const { text, language, style } = queue.items.shift();

    try {
        const stream = await generateAudioStream(text, language, style);
        const resource = createAudioResource(stream);
        
        // Đăng ký player với connection nếu chưa có
        connection.subscribe(queue.player);
        queue.player.play(resource);
    } catch (err) {
        console.error('Lỗi khi phát TTS:', err);
        queue.isPlaying = false;
        playNext(guildId); // Bỏ qua và chơi bài tiếp theo
    }
}

module.exports = {
    addToQueue,
    getGuildQueue
};
