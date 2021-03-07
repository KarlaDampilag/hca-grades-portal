import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button, Radio } from 'antd';


import { MyClass } from '../../interfaces';
import DataTable, { getColumnSearchProps, customSorter } from '../../components/DataTable';
import AddClassModal from '../../components/AddClassModal';

import { MyContext } from '../../App';

const Classes = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [classes, setClasses] = React.useState<readonly MyClass[]>([]);
    const [filter, setFilter] = React.useState<'mine' | 'all'>('mine');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const urlQuery = new URLSearchParams(props.location.search);
    const sectionId = urlQuery.get('sectionId') || undefined;

    React.useEffect(() => {
        setIsLoading(true);
        if (user) {
            const classesQuery = `
                query {
                    classes {
                        id
                        name
                        teacherId {
                            id
                            firstName
                            lastName
                        }
                        sectionId {
                            id
                            name
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
                    query: classesQuery
                })
            })
                .then(res => res.json())
                .then(res => {
                    setClasses(res.data.classes);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setIsLoading(false);
                });
        }
    }, []);

    let finalClasses: MyClass[] = [];
    if (filter == 'mine') {
        const filtered = _.filter(classes, myClass => {
            return myClass.teacherId.id == user?.id;
        });
        finalClasses = [...filtered];
    } else if (filter == 'all') {
        finalClasses = [...classes];
    }

    return (
        <>
            <h1>Classes</h1>

            <Radio.Group onChange={(e) => setFilter(e.target.value)} value={filter}>
                <Radio value='all'>All</Radio>
                <Radio value='mine'>My Classes</Radio>
            </Radio.Group>

            <DataTable
                loading={isLoading}
                data={finalClasses}
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                        sorter: (a, b) => customSorter(a, b, 'name'),
                        ...getColumnSearchProps('name')
                    },
                    {
                        title: 'Section',
                        dataIndex: 'sectionId',
                        key: 'section',
                        render: (sectionId) => {
                            if (sectionId) {
                                return sectionId.name;
                            } else {
                                return null;
                            }
                        },
                        sorter: (a, b) => {
                            if (a && !b) return 1;
                            if (!a && b) return -1;
                            if (!a && !b) return 0;

                            const aName = a.name;
                            const bName = b.name;

                            return aName.localeCompare(bName);
                        },
                        ...getColumnSearchProps('sectionId', { referencedPropertyName: 'name' })
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
                        render: (id) => {
                            return <Link to={`/grade?classId=${id}&quarter=1`}><Button>1st Quarter</Button></Link>;
                        }
                    },
                    {
                        title: '',
                        dataIndex: 'id',
                        key: '2nd-quarter',
                        render: (id) => {
                            return <Link to={`/grade?classId=${id}&quarter=2`}><Button>2nd Quarter</Button></Link>;
                        }
                    },
                    {
                        title: '',
                        dataIndex: 'id',
                        key: '3rd-quarter',
                        render: (id) => {
                            return <Link to={`/grade?classId=${id}&quarter=3`}><Button>3rd Quarter</Button></Link>;
                        }
                    },
                    {
                        title: '',
                        dataIndex: 'id',
                        key: '4th-quarter',
                        render: (id) => {
                            return <Link to={`/grade?classId=${id}&quarter=4`}><Button>4th Quarter</Button></Link>;
                        }
                    },
                    {
                        title: '',
                        dataIndex: 'id',
                        key: 'finale-grades',
                        render: (id) => {
                            return <Link to={`/finalGrades?classId=${id}`}><Button>Final Grades</Button></Link>;
                        }
                    },
                ]}
                footer={(pageData) => {
                    return (
                        <AddClassModal sectionId={sectionId} />
                    )
                }}
            />
        </>
    );
}

export default Classes;
