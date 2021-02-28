import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';


import { MyClass } from '../../interfaces';
import DataTable from '../../components/DataTable';

const Grade = (props) => {
    const [myClass, setMyClass] = React.useState<MyClass>();
    const [quarterNumber, setQuarterNumber] = React.useState<string>('');

    const urlQuery = new URLSearchParams(props.location.search);
    const id = urlQuery.get('classId');
    const quarter = urlQuery.get('quarter');

    React.useEffect(() => {
        const classQuery = `
        query($id: String!) {
            class(id: $id) {
                id
                name
                teacherId {
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

        setQuarterNumber(getQuarterNumber(quarter));
    }, []);

    const getQuarterNumber = (quarter): string => {
        switch (quarter) {
            case '1':
                return '1st';
            case '2':
                return '2nd';
            case '3':
                return '3rd';
            case '4':
                return '4th';
            default:
                return '';
        }
    }

    return (
        <>
            <Link to={`/classes?sectionId=${myClass?.sectionId?.id}`}><Button icon={<ArrowLeftOutlined />}>Return To Classes</Button></Link>
            <h1>{`${quarterNumber} Quarter - ${myClass?.name} - ${myClass?.sectionId?.name}`}</h1>
            <DataTable
                data={[]}
                columns={[

                ]}
                footer={(pageData) => {
                    return (
                        <Link
                            to={`/addGrade?classId=${myClass?.id}&quarter=${quarter}`}
                            style={{ display: 'block' }}
                        >
                            <Button type='primary'>Upload Grades</Button>
                        </Link>
                    )
                }}
            />
        </>
    );
}

export default Grade;
