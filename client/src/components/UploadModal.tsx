import React from 'react';
import { Button, message, Modal, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface Properties {
    onChange: (event) => void,
    buttonTitle?: string
}

const UploadModal = (props: Properties) => {
    const [modalIsVisible, setModalIsVisible] = React.useState<boolean>(false);

    return (
        <>
            <Button onClick={() => setModalIsVisible(true)}>Upload A Section</Button>
            <Modal
                visible={modalIsVisible}
            >
                <Upload
                    name='sectionUploadFile'
                    onChange={props.onChange}
                >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
            </Modal>
        </>
    );
}

export default UploadModal;