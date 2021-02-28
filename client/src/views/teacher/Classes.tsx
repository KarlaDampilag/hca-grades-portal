import React from 'react';
import { Link } from 'react-router-dom';
import { Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Section, User, MyClass } from '../../interfaces';
import DataTable from '../../components/DataTable';
import AddClassModal from '../../components/AddClassModal';

const Classes = (props) => {
    const [section, setSection] = React.useState<Section>();
    const [classes, setClasses] = React.useState<readonly MyClass[]>([]);

    React.useEffect(() => {
        const urlQuery = new URLSearchParams(props.location.search);
        const sectionId = urlQuery.get('sectionId')

        const sectionQuery = `
        query($id: String!) {
            section(id: $id) {
                id
                name
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
                query: sectionQuery,
                variables: {
                    id: sectionId
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setSection(res.data.section);
            })
            .catch(err => console.log(err));

        const classesQuery = `
        query($sectionId: String!) {
            classesBySectionId(sectionId: $sectionId) {
                id
                name
                teacherId {
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
                query: classesQuery,
                variables: {
                    sectionId
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setClasses(res.data.classesBySectionId);
            })
            .catch(err => console.log(err));

    }, []);

    return (
        <>
            <Link to='/sections'><Button icon={<ArrowLeftOutlined />}>Return To Sections</Button></Link>
            <h1>{`Classes - ${section?.name}`}</h1>
            <DataTable
                data={classes}
                columns={[
                    {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name'
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
                        }
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
                ]}
                footer={(pageData) => {
                    return (
                        <AddClassModal section={section} />
                    )
                }}
            />
        </>
    );
}

export default Classes;
