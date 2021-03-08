import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyClass, Grade, User } from '../../interfaces';
import DataTable from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';
import { MyContext } from '../../App';

const viewAllowedRoles = ['admin', 'schoolAdmin', 'teacher'];
interface FinalGrade {
    student: User,
    1: number,
    2: number,
    3: number,
    4: number
}

const getFinalGrades = (grades: Grade[]): FinalGrade[] => {
    const finalGrades: FinalGrade[] = [];
    _.each(grades, rawGrade => {
        const finalGrade = _.find(finalGrades, grade => {
            return rawGrade.studentId.id == grade.student.id;
        });
        if (finalGrade) {
            finalGrade[rawGrade.quarter] = rawGrade.scores.finalGrade;
        } else {
            const newFinalGrade: FinalGrade = {
                student: rawGrade.studentId,
                1: 0,
                2: 0,
                3: 0,
                4: 0
            };
            newFinalGrade[rawGrade.quarter] = rawGrade.scores.finalGrade;
            finalGrades.push(newFinalGrade);
        }
    });
    return finalGrades;
}

// TODO unconfirmed formula
const getFinalGrade = (grade: FinalGrade): number =>  {
    return (grade['1'] + grade['2'] + grade['3'] + grade['4']) / 4;
}

const FinalGrades = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [myClass, setMyClass] = React.useState<MyClass>();
    const [grades, setGrades] = React.useState<readonly FinalGrade[]>();

    const urlQuery = new URLSearchParams(props.location.search);
    const id = urlQuery.get('classId');

    React.useEffect(() => {
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
            query($classId: String!) {
                gradesByClassId(classId: $classId) {
                    id
                    studentId {
                        id
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
                    classId: id
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setGrades(getFinalGrades(res.data.gradesByClassId));
                // setGrades(res.data.gradesByClassId);
            })
            .catch(err => console.log(err));

    }, []);

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <Link to={`/classes?sectionId=${myClass?.sectionId?.id}`}><Button icon={<ArrowLeftOutlined />}>Return To Classes</Button></Link>
            <h1>{`Final grades - ${myClass?.name} - ${myClass?.sectionId?.name}`}</h1>
            <DataTable
                data={grades}
                columns={[
                    {
                        title: '',
                        dataIndex: 'student',
                        key: 'index',
                        render: (id, record, index) => index + 1
                    },
                    {
                        title: 'Student',
                        key: 'student',
                        dataIndex: 'student',
                        render: (student) => {
                            if (student) {
                                return `${student.lastName}, ${student.firstName} ${student.middleInitial}.`;
                            } else {
                                return null;
                            }
                        }
                    },
                    {
                        title: '1st Quarter',
                        dataIndex: '1',
                        key: '1st-quarter'
                    },
                    {
                        title: '2nd Quarter',
                        dataIndex: '2',
                        key: '2nd-quarter'
                    },
                    {
                        title: '3rd Quarter',
                        dataIndex: '3',
                        key: '3rd-quarter'
                    },
                    {
                        title: '4th Quarter',
                        dataIndex: '4',
                        key: '4th-quarter'
                    },
                    {
                        title: 'Final Grade',
                        dataIndex: 'student',
                        key: 'final-grade',
                        render: (value, record) => {
                            return getFinalGrade(record);
                        }
                    },
                ]}
            />
        </>
    );
}

export default FinalGrades;
