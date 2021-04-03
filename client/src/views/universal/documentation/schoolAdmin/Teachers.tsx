import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyContext } from '../../../../App';

import NoViewPermission from '../../../../components/NoViewPermission';

import TeachersViewImg from '../../../../assets/img/docs/teachers-view.png';
import UploadTeachersViewImg from '../../../../assets/img/docs/upload-teachers-view.png';
import SampleTeachersExcelImg from '../../../../assets/img/docs/sample-teachers-excel.png';

const viewAllowedRoles = ['admin', 'schoolAdmin'];

const Teachers = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const role = user?.role.type;

    if (!(role && viewAllowedRoles.includes(role))) {
        return <NoViewPermission />
    }

    return (
        <>
            <Link to={`/docs`}><Button icon={<ArrowLeftOutlined />}>Back To Documentation Index</Button></Link>
            <h1>Documentation for School Admin</h1>

            <h2>1. View Teachers</h2>
            <p>Only users with the <b>school admin</b> role can view and upload teachers.</p>
            <img src={TeachersViewImg} alt='Teachers view' />
            <p>Clicking on the <i>Add Teachers</i> button will navigate you to the <i>Upload Teachers</i> view.</p>

            <h2>2. Upload Teachers</h2>
            <img src={UploadTeachersViewImg} alt='Uplaod teachers view' />

            <br /><br />

            <h3>Steps:</h3>
            <ol>
                <li>Upload the teachers Excel file. <b>IMPORTANT:</b> The excel file <b>MUST</b> have the following headers, in order for the system to properly map the teacher properties (must be lowercase):</li>
                <ul>
                    <li>index</li>
                    <li>name</li>
                </ul>
                <p>Each teacher row must have a value under the <i>index</i> header.</p>
                <img src={SampleTeachersExcelImg} alt='Example of a teachers Excel file' />
                <br /><br />
                <li>Review the teachers list preview. To proceed, click on the <i>Upload To Database</i> button, and confirm the upload.</li>
                <li>The system will generate and download to your machine an Excel file that contains the login details of the teachers. Please inform each teacher about their login credentials, and keep the file in a safe place.</li>
            </ol>
        </>
    );
}

export default Teachers;