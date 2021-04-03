import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyContext } from '../../../../App';

import NoViewPermission from '../../../../components/NoViewPermission';

import ClassesViewImg from '../../../../assets/img/docs/classes-view.png';
import AddClassViewImg from '../../../../assets/img/docs/add-class-view.png';

const viewAllowedRoles = ['admin', 'schoolAdmin', 'teacher'];

const Classes = () => {
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
            <h2>1. View Classes</h2>
            <p>Users with the <b>teacher</b> role can view and add a class.</p>
            <img src={ClassesViewImg} alt='Sections view' />
            <p>Clicking on the <i>Add Class</i> button will prompt the <i>Add A Class</i> popup.</p>

            <h2>2. Add a Class</h2>
            <img src={AddClassViewImg} alt='Add class view' />

            <br /><br />

            <h3>Steps:</h3>
            <ol>
                <li>Select a section.</li>
                <li>Input a class name.</li>
                <li>Click <i>Add To Database</i></li>
            </ol>
        </>
    );
}

export default Classes;