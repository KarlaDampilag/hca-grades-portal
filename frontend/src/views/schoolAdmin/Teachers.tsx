import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { User, Role } from '../../interfaces';

import DataTable from '../../components/DataTable';

interface Properties { }

const Teachers = (props: Properties) => {
    const [teachers, setTeachers] = React.useState<readonly User[]>();

    React.useEffect(() => {
        const query = `
        query {
            users(filter: {role: {type: "teacher"}}){
                id
                firstName
                lastName
                email
                password
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
                setTeachers(res.data.users);
            })
            .catch(err => console.log(err));
    }, []);

    console.log(teachers)

    return (
        <>
            <DataTable
                data={teachers}
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
                    }
                ]}
                footer={(pageData) => {
                    return (
                        <>
                            <Link
                                to='/addTeacher'
                                style={{ display: 'block' }}
                            >
                                <Button type='primary'>Add Teachers</Button>
                            </Link>
                        </>
                    )
                }}
            />
        </>
    )
}

export default Teachers;
