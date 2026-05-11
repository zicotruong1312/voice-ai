const { Collection } = require('discord.js');

// Map để lưu trữ cấu hình cho từng guild (server)
// Key: Guild ID
// Value: { allowed: 'everyone' | 'role_id' | 'user_id', language: 'vi-VN' }
const guildConfigs = new Collection();

function getConfig(guildId) {
    if (!guildConfigs.has(guildId)) {
        guildConfigs.set(guildId, {
            allowed: 'everyone',
            language: 'vi-VN'
        });
    }
    return guildConfigs.get(guildId);
}

function updateConfig(guildId, key, value) {
    const config = getConfig(guildId);
    config[key] = value;
    guildConfigs.set(guildId, config);
    return config;
}

function resetConfig(guildId) {
    guildConfigs.set(guildId, {
        allowed: 'everyone',
        language: 'vi-VN'
    });
    return guildConfigs.get(guildId);
}

module.exports = {
    guildConfigs,
    getConfig,
    updateConfig,
    resetConfig
};
