'use strict';
const { Modal, Blocks } = require('slack-block-builder');

const travelRequestRejected = () => {
    return Modal({ title: 'Ready to Fly', close: 'Close' })
        .blocks(
            Blocks.Section({
                text: 'travel request successfully rejected'
            })
        )
        .buildToJSON();
};

module.exports = { travelRequestRejected };
