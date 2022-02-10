'use strict';
const { Modal, Blocks, Elements, Bits } = require('slack-block-builder');

const createTravelRequestForm = (approvers) => {
    return Modal({ title: 'New Travel Request', submit: 'Submit' })
        .blocks(
            Blocks.Input({ label: 'Origin' })
                .element(
                    Elements.TextInput({
                        placeholder: 'Hawaii'
                    }).actionId('input-origin')
                )
                .blockId('input-origin'),
            Blocks.Input({ label: 'Destination' })
                .element(
                    Elements.TextInput({
                        placeholder: 'New Zealand'
                    }).actionId('input-dest')
                )
                .blockId('input-dest'),
            Blocks.Input({ label: 'Start Date' })
                .element(
                    Elements.DatePicker({
                        initialDate: new Date()
                    }).actionId('input-start-date')
                )
                .blockId('input-start-date'),
            Blocks.Input({ label: 'End Date' })
                .element(
                    Elements.DatePicker({
                        initialDate: new Date()
                    }).actionId('input-end-date')
                )
                .blockId('input-end-date'),
            Blocks.Input({ label: 'Estimated Cost (USD)' })
                .element(
                    Elements.TextInput({
                        placeholder: '3000'
                    }).actionId('input-cost')
                )
                .blockId('input-cost'),
            Blocks.Input({ label: 'Approver' })
                .element(
                    Elements.StaticSelect({
                        placeholder: 'Select Approver...'
                    })
                        .actionId('input-approver')
                        .options(
                            approvers.map((approver) =>
                                Bits.Option({
                                    text: approver.name,
                                    value: approver.id
                                })
                            )
                        )
                )
                .blockId('input-approver'), // Map items to Option objects
            Blocks.Input({ label: 'Description' })
                .element(
                    Elements.TextInput({
                        multiline: true
                    }).actionId('input-desc')
                )
                .blockId('input-desc')
        )
        .callbackId('initiate_travel_request')
        .buildToJSON();
};

module.exports = { createTravelRequestForm };
