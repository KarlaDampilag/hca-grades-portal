import React from 'react';
import { Link } from 'react-router-dom';

import { MyContext } from '../../../App';

import NoViewPermission from '../../../components/NoViewPermission';

const viewAllowedRoles = ['admin', 'schoolAdmin', 'teacher'];

const Documentation = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <h1>Documentation</h1>

            <h2>School Admin</h2>
            <ul>
                <li><Link to='/docs/schoolAdmin/teachers'>View and add Teachers</Link></li>
                <li><Link to='/docs/schoolAdmin/sections'>View and add Sections</Link></li>
            </ul>
        </>
    );
}

export default Documentation;