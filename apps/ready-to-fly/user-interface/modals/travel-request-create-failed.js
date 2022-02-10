'use strict';
const { Modal, Blocks, Md } = require('slack-block-builder');

const travelRequestCreationFailed = () => {
    return Modal({ title: 'Ready to Fly', close: 'Close' })
        .blocks(
            Blocks.Section({
                text: 'Ops! travel request creation failed'
            })
        )
        .buildToJSON();
};

module.exports = { travelRequestCreationFailed };
