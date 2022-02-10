'use strict';
const { Modal, Blocks, Md } = require('slack-block-builder');

const travelRequestApproved = () => {
    return Modal({ title: 'Ready to Fly', close: 'Close' })
        .blocks(
            Blocks.Section({
                text: `travel request successfully approved ${Md.emoji(
                    'tada'
                )}!!!`
            })
        )
        .buildToJSON();
};

module.exports = { travelRequestApproved };
