import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';


import { MyClass, Grade, } from '../../interfaces';
import DataTable from '../../components/DataTable';
import { getQuarterNumber } from '../../utils/utils';

import { MyContext } from '../../App';

const GradeView = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [myClass, setMyClass] = React.useState<MyClass>();
    const [quarterNumber, setQuarterNumber] = React.useState<string>('');
    const [grades, setGrades] = React.useState<readonly Grade[]>();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const urlQuery = new URLSearchParams(props.location.search);
    const id = urlQuery.get('classId');
    const quarter = urlQuery.get('quarter');

    React.useEffect(() => {
        setIsLoading(true);
        const classQuery = `
        query($id: String!) {
            class(id: $id) {
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
                query: classQuery,
                variables: {
                    id
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setMyClass(res.data.class);
            })
            .catch(err => console.log(err));

        const gradesQuery = `
            query($classId: String!, $quarter: Int) {
                gradesByClassId(classId: $classId, quarter: $quarter) {
                    id
                    studentId {
                        firstName
                        lastName
                        middleInitial
                    }
                    scores
                    quarter
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
                query: gradesQuery,
                variables: {
                    classId: id,
                    quarter: parseInt(quarter as string)
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setGrades(res.data.gradesByClassId);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });

        setQuarterNumber(getQuarterNumber(quarter));
    }, []);

    const userCanUploadGrade = () => {
        let ret = false;
        if (user?.role.type == 'admin' || user?.role.type == 'schoolAdmin') {
            ret = true;
        } else if (myClass?.teacherId.id == user?.id) {
            ret = true;
        }
        return ret;
    }

    return (
        <>
            <Link to={`/classes?sectionId=${myClass?.sectionId?.id}`}><Button icon={<ArrowLeftOutlined />}>Return To Classes</Button></Link>
            <h1>{`${quarterNumber} Quarter - ${myClass?.name} - ${myClass?.sectionId?.name}`}</h1>
            <DataTable
                loading={isLoading}
                data={grades}
                columns={[
                    {
                        title: '',
                        dataIndex: 'studentId',
                        key: 'index',
                        render: (id, record, index) => index + 1
                    },
                    {
                        title: 'Student',
                        key: 'student',
                        dataIndex: 'studentId',
                        render: (student) => {
                            if (student) {
                                return `${student.lastName}, ${student.firstName} ${student.middleInitial}.`;
                            } else {
                                return null;
                            }
                        }
                    },
                    {
                        title: 'Written Works',
                        dataIndex: ['scores', 'ww'],
                        key: 'Written Works',
                        render: (score, record) => (
                            `${score} / ${record.scores.wwTotal}`
                        )
                    },
                    {
                        title: 'Performance Task',
                        dataIndex: ['scores', 'pt'],
                        key: 'Performance Task',
                        render: (score, record) => (
                            `${score} / ${record.scores.ptTotal}`
                        )
                    },
                    {
                        title: 'QA',
                        dataIndex: ['scores', 'qa'],
                        key: 'QA',
                        render: (score, record) => (
                            `${score} / ${record.scores.qaTotal}`
                        )
                    },
                    {
                        title: 'Initial Grade',
                        dataIndex: ['scores', 'initialGrade'],
                        key: 'Initial Grade'
                    },
                    {
                        title: 'Final Grade',
                        dataIndex: ['scores', 'finalGrade'],
                        key: 'Final Grade'
                    }
                ]}
                footer={(pageData) => {
                    return (
                        <Button type='primary' disabled={!userCanUploadGrade()}>
                            <Link
                                to={`/addGrade?classId=${myClass?.id}&quarter=${quarter}`}
                                style={{ display: 'block' }}
                            >
                                Upload Grades
                            </Link>
                        </Button>
                    )
                }}
            />
        </>
    );
}

export default GradeView;
