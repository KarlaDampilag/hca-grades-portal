import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button, Radio } from 'antd';

import { Section } from '../../interfaces';

import DataTable from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';

import { MyContext } from '../../App';

interface Properties { }

const viewAllowedRoles = ['admin', 'schoolAdmin'];

const Sections = (props: Properties) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [sections, setSections] = React.useState<readonly Section[]>([]);
    const [sectionFilter, setSectionFilter] = React.useState<'mine' | 'all'>('all');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsLoading(true);
        if (user) {
            const query = `
                query {
                    sections {
                        id
                        name
                        adviserId {
                            id
                            firstName
                            lastName
                        }
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
                    query
                })
            })
                .then(res => res.json())
                .then(res => {
                    setSections(res.data.sections);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setIsLoading(false);
                });
        }
    }, []);

    let finalSections: Section[] = [];
    if (sectionFilter == 'mine') {
        const filteredSections = _.filter(sections, section => {
            return section.adviserId.id == user?.id;
        });
        finalSections = [...filteredSections];
    } else if (sectionFilter == 'all' && sections) {
        finalSections = [...sections];
    }

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            {/* <Radio.Group onChange={(e) => setSectionFilter(e.target.value)} value={sectionFilter}>
                <Radio value='all'>All</Radio>
                <Radio value='mine'>My Section</Radio>
            </Radio.Group> */}
            <h1>Sections</h1>
            <DataTable
                loading={isLoading}
                data={finalSections}
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
                    },
                    {
                        title: 'Student List',
                        dataIndex: 'id',
                        key: 'studentList',
                        render: (id) => {
                            return <Link to={`/section?id=${id}`}><Button>Students</Button></Link>;
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