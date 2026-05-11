const { resetConfig } = require('../config/guildConfig');

module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
        // Kiểm tra xem đối tượng thay đổi trạng thái có phải là bot không
        if (oldState.member.id !== oldState.client.user.id) return;

        // Nếu bot trước đó ở trong 1 kênh thoại (oldState.channelId != null) 
        // và hiện tại đã rời khỏi kênh thoại (newState.channelId == null)
        if (oldState.channelId !== null && newState.channelId === null) {
            console.log(`Bot đã rời khỏi kênh voice ở guild: ${oldState.guild.id}. Đang reset config...`);
            resetConfig(oldState.guild.id);
        }
    }
};
