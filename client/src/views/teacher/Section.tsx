import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import DataTable from '../../components/DataTable';
import { Section, User } from '../../interfaces';
import NoViewPermission from '../../components/NoViewPermission';
import { MyContext } from '../../App';

const viewAllowedRoles = ['admin', 'schoolAdmin', 'teacher'];

const SectionView = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [section, setSection] = React.useState<Section>();
    const [students, setStudents] = React.useState<readonly User[]>();

    React.useEffect(() => {
        const urlQuery = new URLSearchParams(props.location.search);
        const id = urlQuery.get('id')

        const sectionQuery = `
        query($id: String!) {
            section(id: $id) {
                id
                name
            }
        }
        `;

        fetch(`${process.env.REACT_APP_SERVER_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                query: sectionQuery,
                variables: {
                    id
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setSection(res.data.section);
            })
            .catch(err => console.log(err));

        const studentsQuery = `
        query($id: String!) {
            studentsBySectionId(id: $id) {
                id
                firstName
                lastName
                middleInitial
            }
        }
        `;

        fetch(`${process.env.REACT_APP_SERVER_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                query: studentsQuery,
                variables: {
                    id
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setStudents(res.data.studentsBySectionId);
            })
            .catch(err => console.log(err));

    }, []);

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <Link to='/sections'><Button icon={<ArrowLeftOutlined />}>Return To Sections</Button></Link>
            <h1>{section?.name}</h1>
            <DataTable
                data={students}
                columns={[
                    {
                        title: '',
                        dataIndex: 'id',
                        key: 'id',
                        render: (id, record, index) => (index + 1)
                    },
                    {
                        title: 'Last Name',
                        dataIndex: 'lastName',
                        key: 'lastName'
                    },
                    {
                        title: 'First Name',
                        dataIndex: 'firstName',
                        key: 'firstName'
                    },
                    {
                        title: 'Middle Initial',
                        dataIndex: 'middleInitial',
                        key: 'middleInitial'
                    },
                ]}
            />
        </>
    );
};

export default SectionView;
