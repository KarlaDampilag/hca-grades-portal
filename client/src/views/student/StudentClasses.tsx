import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button } from 'antd';


import { MyClass } from '../../interfaces';
import DataTable, { getColumnSearchProps, customSorter } from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';

import { MyContext } from '../../App';

const viewAllowedRoles = ['admin', 'student'];

const StudentClasses = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [classes, setClasses] = React.useState<readonly MyClass[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsLoading(true);
        if (user) {
            const sectionId = user.role.sectionId;
            const classesQuery = `
                query($sectionId: String!) {
                    classesBySectionId(sectionId: $sectionId) {
                        id
                        name
                        teacherId {
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
                    query: classesQuery,
                    variables: {
                        sectionId
                    }
                })
            })
                .then(res => res.json())
                .then(res => {
                    setClasses(res.data.classesBySectionId);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setIsLoading(false);
                });
        }
    }, []);

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <h1>Classes</h1>

            <DataTable
                loading={isLoading}
                data={classes}
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                        sorter: (a, b) => customSorter(a, b, 'name'),
                        ...getColumnSearchProps('name')
                    },
                    {
                        title: 'Teacher',
                        dataIndex: 'teacherId',
                        key: 'teacherId',
                        render: (teacherId) => {
                            if (teacherId) {
                                return `${teacherId.lastName}, ${teacherId.firstName}`;
                            } else {
                                return null;
                            }
                        },
                        sorter: (a, b) => {
                            if (a && !b) return 1;
                            if (!a && b) return -1;
                            if (!a && !b) return 0;

                            const aName = `${a.teacherId.lastName}, ${a.teacherId.firstName}`;
                            const bName = `${b.teacherId.lastName}, ${b.teacherId.firstName}`;

                            return aName.localeCompare(bName);
                        },
                        ...getColumnSearchProps(
                            'teacherId',
                            {
                                customFilter: (valueToSearch, record) => {
                                    const name = `${record.teacherId.lastName}, ${record.teacherId.firstName}`;
                                    return name.toLowerCase().indexOf(valueToSearch.toLowerCase()) >= 0;
                                }
                            }
                        )
                    },
                    {
                        title: 'Grades',
                        dataIndex: 'id',
                        key: '1st-quarter',
                        render: (id, record) => {
                            return <Link to={`/studentGrade?classId=${id}&class=${record.name}`}><Button>View</Button></Link>;
                        }
                    }
                ]}
            />
        </>
    );
}

export default StudentClasses;
