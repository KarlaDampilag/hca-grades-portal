import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyContext } from '../../../../App';

import NoViewPermission from '../../../../components/NoViewPermission';

import ViewGradeGif from '../../../../assets/img/docs/view-grade.gif';
import UploadGradeGif from '../../../../assets/img/docs/upload-grade.gif';
import SampleGradeFileImg from '../../../../assets/img/docs/sample-grade-excel.png';

const viewAllowedRoles = ['admin', 'schoolAdmin', 'teacher'];

const Grades = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const role = user?.role.type;

    if (!(role && viewAllowedRoles.includes(role))) {
        return <NoViewPermission />
    }

    return (
        <>
            <Link to={`/docs`}><Button icon={<ArrowLeftOutlined />}>Back To Documentation Index</Button></Link>
            <h1>Documentation for Teachers</h1>
            <h2>1. View Grades</h2>
            <p>Users with the <b>teacher</b> role can view and upload grades. These can be viewed from the <i>Classes</i> table.</p>
            <img src={ViewGradeGif} alt='Grades view' />
            <p>Clicking on the <i>Upload Grades</i> button will navigate you to the <i>Upload Grades</i> view.</p>

            <h2>2. Upload</h2>
            <img src={UploadGradeGif} alt='Upload grade view' />

            <br /><br />

            <h3>Steps:</h3>
            <ol>
                <li>Upload the grades Excel file. <b>IMPORTANT:</b> The excel file <b>MUST</b> have the following headers, in order for the system to properly map the grade properties (case-sensitive):</li>
                <ul>
                    <li>lrn</li>
                    <li>WW</li>
                    <li>WW-total</li>
                    <li>PT</li>
                    <li>PT-total</li>
                    <li>QA</li>
                    <li>QA-total</li>
                    <li>initial</li>
                    <li>final</li>
                </ul>
                <p>Each student row must have a value under the <i>lrn</i> header.</p>
                <img src={SampleGradeFileImg} alt='Example of a grade Excel file' />
                <br /><br />
                <li>Review the grade preview. To proceed, click on the <i>Upload To Database</i> button, and confirm the upload.</li>
                <p><b>IMPORTANT:</b> Confirming your upload will overwrite any currently saved grades in the database for this quarter.</p>
            </ol>
        </>
    );
}

export default Grades;