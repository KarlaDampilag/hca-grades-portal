import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { User } from '../../interfaces';

import DataTable from '../../components/DataTable';

interface Properties { }

const Users = (props: Properties) => {
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

    return (
        <>
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
                        }
                    },
                    {
                        title: 'Username',
                        dataIndex: 'email',
                        key: 'email'
                    },
                    {
                        title: 'Role',
                        dataIndex: 'role',
                        key: 'role',
                        render: (role) => {
                            return role.type;
                        }
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