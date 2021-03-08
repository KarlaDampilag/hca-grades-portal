import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { User } from '../../interfaces';

import DataTable, { getColumnSearchProps, customSorter } from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';
import { MyContext } from './../../App';


const viewAllowedRoles = ['admin'];

interface Properties { }

const Users = (props: Properties) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [users, setUsers] = React.useState<readonly User[]>();

    React.useEffect(() => {
        const query = `
        query {
            users {
                firstName
                lastName
                middleInitial
                email
                role
            }
        }
        `;

        fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                query
            })
        })
            .then(res => res.json())
            .then(res => {
                setUsers(res.data.users);
            })
            .catch(err => console.log(err));
    }, []);

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <h1>Users</h1>
            <DataTable
                data={users}
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'lastName',
                        key: 'fullName',
                        render: (lastName, user) => {
                            let fullName = `${lastName}, ${user.firstName}`;
                            if (user.middleInitial) {
                                fullName = fullName.concat(` ${user.middleInitial}.`);
                            }
                            return fullName;
                        },
                        sorter: (a, b) => {
                            if (a && !b) return 1;
                            if (!a && b) return -1;
                            if (!a && !b) return 0;

                            const aName = `${a.lastName}, ${a.firstName}`;
                            const bName = `${b.lastName}, ${b.firstName}`;

                            return aName.localeCompare(bName);
                        },
                        ...getColumnSearchProps(
                            'lastName',
                            {
                                customFilter: (valueToSearch, record) => {
                                    const name = `${record.lastName}, ${record.firstName}`;
                                    return name.toLowerCase().indexOf(valueToSearch.toLowerCase()) >= 0;
                                }
                            }
                        )
                    },
                    {
                        title: 'Username',
                        dataIndex: 'email',
                        key: 'email',
                        sorter: (a, b) => customSorter(a, b, 'email'),
                        ...getColumnSearchProps('email')
                    },
                    {
                        title: 'Role',
                        dataIndex: 'role',
                        key: 'role',
                        render: (role) => {
                            return role.type;
                        },
                        sorter: true,
                        ...getColumnSearchProps(
                            'lastName',
                            {
                                customFilter: (valueToSearch, record) => {
                                    const name = `${record.role.type}, ${record.role.type}`;
                                    return name.toLowerCase().indexOf(valueToSearch.toLowerCase()) >= 0;
                                }
                            }
                        )
                    }
                ]}
                footer={(pageData) => {
                    return (
                        <>
                            <Link
                                to='/addUser'
                                style={{ display: 'block' }}
                            >
                                <Button type='primary'>Add User</Button>
                            </Link>
                        </>
                    )
                }}
            />
        </>
    )
}

export default Users;