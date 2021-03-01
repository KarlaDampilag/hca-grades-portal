import React from 'react';
import { Button, Modal } from 'antd';

interface Properties {
    visible: boolean,
    onConfirm: () => void,
    onCancel: () => void
}

const ConfirmationModal = (props: Properties) => {
    return (
        <Modal
            visible={props.visible}
            footer={[
                <Button key='cancel' onClick={props.onCancel}>Cancel</Button>,
                <Button key='confirm' type='primary' onClick={props.onConfirm}>Confirm</Button>
            ]}
            onCancel={props.onCancel}
        >
            <span>Are you sure? This action is final.</span>
        </Modal>
    )
}

export default ConfirmationModal;