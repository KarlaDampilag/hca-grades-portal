import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import { Section } from '../../interfaces';

import DataTable from '../../components/DataTable';


interface Properties { }

const Sections = (props: Properties) => {
    const [sections, setSections] = React.useState<readonly Section[]>();

    React.useEffect(() => {
        const query = `
        query {
            sections {
                id
                name
                adviserId {
                    firstName
                    lastName
                }
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
                setSections(res.data.sections);
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <>
            <DataTable
                data={sections}
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name, record) => {
                            return <Link to={`/section?id=${record.id}`}>{`${name}`}</Link>;
                        }
                    },
                    {
                        title: 'Adviser',
                        dataIndex: 'adviserId',
                        key: 'adviserId',
                        render: (adviserId) => {
                            if (adviserId) {
                                return `${adviserId.lastName}, ${adviserId.firstName}`;
                            } else {
                                return null;
                            }
                        }
                    }
                ]}
                footer={(pageData) => {
                    return (
                        <Link
                            to='/addSection'
                            style={{ display: 'block' }}
                        >
                            <Button type='primary'>Add Section</Button>
                        </Link>
                    )
                }}
            />
            <div>

            </div>
        </>
    )
}

export default Sections;