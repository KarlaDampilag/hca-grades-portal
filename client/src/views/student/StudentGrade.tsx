import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { MyClass, Grade, } from '../../interfaces';
import DataTable from '../../components/DataTable';
import NoViewPermission from '../../components/NoViewPermission';
import { MyContext } from '../../App';

const viewAllowedRoles = ['admin', 'student'];

const GradeView = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const currentUserRole = user?.role.type;

    const [grades, setGrades] = React.useState<readonly Grade[]>();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const urlQuery = new URLSearchParams(props.location.search);
    const id = urlQuery.get('classId');
    const className = urlQuery.get('class');

    React.useEffect(() => {
        setIsLoading(true);

        const gradesQuery = `
            query($classId: String!) {
                studentGradesByClassId(classId: $classId) {
                    id
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
                setGrades(res.data.studentGradesByClassId);
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

    const getFinalGrade = (): number | 'NA' => {
        let ret: 'NA' = 'NA';
        let sum = 0;

        if (grades && grades.length == 4) {
            _.forEach(grades, grade => {
                sum += grade.scores.finalGrade;
            });
        } else {
            return ret;
        }

        return sum / 4;
    }

    const sortedByQuarter = _.sortBy(grades, 'quarter');

    return (
        <>
            <Link to={`/studentClasses`}><Button icon={<ArrowLeftOutlined />}>Return To Classes</Button></Link>
            <h1>{`${className}`}</h1>
            <DataTable
                loading={isLoading}
                data={sortedByQuarter}
                columns={[
                    {
                        title: 'Quarter',
                        key: 'quarter',
                        dataIndex: 'quarter'
                    },
                    {
                        title: 'Written Works',
                        dataIndex: ['scores', 'ww'],
                        key: 'Written Works',
                        render: ((value, record) => (
                            `${value} / ${record.scores.wwTotal}`
                        ))
                    },
                    {
                        title: 'Performance Task',
                        dataIndex: ['scores', 'pt'],
                        key: 'Performance Task',
                        render: ((value, record) => (
                            `${value} / ${record.scores.ptTotal}`
                        ))
                    },
                    {
                        title: 'QA',
                        dataIndex: ['scores', 'qa'],
                        key: 'qa',
                        render: ((value, record) => (
                            `${value} / ${record.scores.qaTotal}`
                        ))
                    },
                    {
                        title: 'Initial Grade',
                        dataIndex: ['scores', 'initialGrade'],
                        key: 'initialGrade'
                    },
                    {
                        title: 'Final Grade',
                        dataIndex: ['scores', 'finalGrade'],
                        key: 'Final Grade'
                    }
                ]}
            />
            <h2>Final Grade: {getFinalGrade()}</h2>
        </>
    );
}

export default GradeView;
