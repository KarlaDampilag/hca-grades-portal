import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyContext } from '../../../../App';

import NoViewPermission from '../../../../components/NoViewPermission';

import SectionViewImg from '../../../../assets/img/docs/section-view.png';
import AddSectionGif from '../../../../assets/img/docs/add-section.gif';
import SampleSectionFileImg from '../../../../assets/img/docs/sample-section-excel.png';

const viewAllowedRoles = ['admin', 'schoolAdmin'];

const Sections = () => {
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
            <h2>1. View Sections</h2>
            <p>Only users with the <b>school admin</b> role can view and upload sections.</p>
            <img src={SectionViewImg} alt='Sections view' />
            <p>Clicking on the <i>Add Section</i> button will navigate you to the <i>Add A Section</i> view.</p>

            <h2>2. Add a Section</h2>
            <img src={AddSectionGif} alt='Add section view' />

            <br /><br />

            <h3>Steps:</h3>
            <ol>
                <li>Input Section name.</li>
                <li>Select the adviser.</li>
                <li>Upload the section Excel file. <b>IMPORTANT:</b> The excel file <b>MUST</b> have the following headers, in order for the system to properly map the student properties (must be lowercase):</li>
                <ul>
                    <li>index</li>
                    <li>name</li>
                    <li>lrn</li>
                </ul>
                <p>Each student row must have a value under the <i>index</i> header.</p>
                <img src={SampleSectionFileImg} alt='Example of a section Excel file' />
                <br /><br />
                <li>Review the student list preview. To proceed, click on the <i>Upload To Database</i> button, and confirm the upload.</li>
                <li>The system will generate and download to your machine an Excel file that contains the login details of the students. Please inform each student about their login credentials, and keep the file in a safe place.</li>
            </ol>
        </>
    );
}

export default Sections;