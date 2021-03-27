import React from 'react';
import * as _ from 'lodash';

import { Grade, MyClass } from '../../interfaces';
import { getFinalGradeView } from '../../utils/utils';

import DataTable from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';
import { MyContext } from '../../App';

const viewAllowedRoles = ['admin', 'student'];

interface FinalGrade {
    class: MyClass,
    1: number,
    2: number,
    3: number,
    4: number
}

const getQuarterFinalGradesOfClasses = (grades: Grade[]): FinalGrade => {
    const finalGrades: FinalGrade[] = [];
    _.each(grades, rawGrade => {
        const finalGrade = _.find(finalGrades, grade => {
            if (rawGrade.classId) {
                return rawGrade.classId.id == grade.class.id;
            }
        });
        if (finalGrade) {
            finalGrade[rawGrade.quarter] = rawGrade.scores.finalGrade;
        } else {
            const newFinalGrade: FinalGrade = {
                class: rawGrade.classId,
                1: 0,
                2: 0,
                3: 0,
                4: 0
            };
            newFinalGrade[rawGrade.quarter] = rawGrade.scores?.finalGrade;
            finalGrades.push(newFinalGrade);
        }
    });
    return finalGrades[0];
}

const StudentFinalGrades = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [finalGrades, setFinalGrades] = React.useState<readonly FinalGrade[]>(); // TODO type this state
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const getFinalFinalGrades = (allGrades: Grade[]) => { // TODO type the return val
        const groupedGradesByClass: { [classId: string]: Grade[] } = {};

        // arrage them in key-value pair, by class ID then value is final grade
        _.forEach(allGrades, grade => {
            if (!groupedGradesByClass[grade.classId.id]) {
                groupedGradesByClass[grade.classId.id] = [];
            }
            groupedGradesByClass[grade.classId.id].push(grade);
        });

        const calculatedFinalGrades = _.map(groupedGradesByClass, groupedGrades => {
            return getQuarterFinalGradesOfClasses(groupedGrades);
        });

        setFinalGrades(calculatedFinalGrades);
    }

    React.useEffect(() => {
        setIsLoading(true);
        const query = `
            query {
                gradesByStudentId {
                    id
                    scores
                    quarter
                    classId {
                        id
                        name
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
                console.log(res.data.gradesByStudentId);
                console.log(getFinalFinalGrades(res.data.gradesByStudentId));
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    if (!(currentUserRole && viewAllowedRoles.includes(currentUserRole))) {
        return <NoViewPermission />
    }

    return (
        <>
            <h1>Final Grades</h1>
            <DataTable
                loading={isLoading}
                data={finalGrades}
                columns={[
                    {
                        title: '',
                        dataIndex: 'class',
                        key: 'class',
                        render: (myClass) => {
                            return myClass.name
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
                            return getFinalGradeView(record);
                        }
                    },
                ]}
            />
        </>
    );
}

export default StudentFinalGrades;