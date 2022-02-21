'use strict';
const { Modal, Blocks, Md } = require('slack-block-builder');

const travelRequestSuccess = () => {
    return Modal({ title: 'Ready to Fly', close: 'Close' })
        .blocks(
            Blocks.Section({
                text: `Travel request successfully created ${Md.emoji(
                    'tada'
                )}!!!`
            })
        )
        .buildToJSON();
};

module.exports = { travelRequestSuccess };
