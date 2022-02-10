const {
    pendingTravelRequestsCallback
} = require('../utils/home-tab-callbacks');

const refreshUIAfterStatusChange = async (body, client, context) => {
    const container = body.container;
    if (container.type == 'message') {
        // Delete Message
        const messageTs = container.message_ts;
        const channelId = container.channel_id;

        await client.chat.delete({
            channel: channelId,
            ts: messageTs
        });
    } else {
        // Refresh home tab view
        pendingTravelRequestsCallback(context, client, body.user.id);
    }
};

module.exports = { refreshUIAfterStatusChange };
