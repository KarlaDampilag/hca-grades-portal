import React from 'react';
import { Link } from 'react-router-dom'
import { Input, Form, Button, message, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

import { generateId, generateUsername, generatePassword } from '../../utils/utils';
import { User, Grade } from '../../interfaces';

import DataTable from '../../components/DataTable';
import ConfirmationModal from '../../components/ConfirmationModal';

import { MyContext } from './../../App';

const AddGrade = (props) => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [grades, setGrades] = React.useState<readonly Grade[]>([]);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] = React.useState<boolean>(false);
    const [students, setStudents] = React.useState<readonly User[]>();

    const urlQuery = new URLSearchParams(props.location.search);
    const classId = urlQuery.get('classId');
    const quarter = urlQuery.get('quarter');

    React.useEffect(() => {
        const query = `
        query($id: String!) {
            studentsByClassId(id: $id) {
                id
                firstName
                lastName
                middleInitial
                email
                role
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
                query,
                variables: {
                    id: classId
                }
            })
        })
            .then(res => res.json())
            .then(res => {
                setStudents(res.data.studentsByClassId);
            })
            .catch(err => console.log(err));
    }, []);

    const normFile = (event) => {
        if (event && event.target && event.target.files) {
            return event.target.files[0]
        }
    };

    const getStudentIdFromLRN = (lrn: string): string => {
        const student = _.find(students, student => {
            return student.role.lrn == lrn;
        });

        if (student) {
            return student.id;
        } else {
            return '';
        }
    }

    const getScoresFromJson = (jsonObject) => {
        return {
           ww: jsonObject.WW,
           wwTotal: jsonObject['WW-total'],
           pt: jsonObject.PT,
           ptTotal: jsonObject['PT-total'],
           qa: jsonObject.QA,
           qaTotal: jsonObject['QA-total'],
           initialGrade: jsonObject.initial,
           finalGrade: jsonObject.final
        }
    }

    const transformGradesFromUpload = (jsonObject): Grade => {
        const id = generateId('grade');
        const studentId: string = getStudentIdFromLRN(jsonObject.lrn);
        const scores = getScoresFromJson(jsonObject);

        return {
            id,
            studentId,
            scores,
            classId: classId ? classId : '',
            quarter: quarter ? parseInt(quarter) : 0
        };
    }

    const handleFileUploadChange = (event): void => {
        const files = event.target.files
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (e) => { // TODO break into smaller functions!
            if (e && e.target && e.target.result) {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_json(ws, { blankrows: false });
                const filteredData = _.filter(data, jsonObject => {
                    if (jsonObject.lrn) {
                        return jsonObject;
                    }
                });
                console.log(filteredData)

                let sheetIsValid = true;
                const newGrades: Grade[] = [];
                for (const jsonObject of filteredData) {
                    if (jsonObject.lrn) {
                        const gradeObj: Grade = transformGradesFromUpload(jsonObject);
                        newGrades.push(gradeObj);
                    } else {
                        sheetIsValid = false;
                    }
                };
                console.log(newGrades)
                if (sheetIsValid) {
                    setGrades(newGrades);
                } else {
                    message.error('Some student fields are not filled in. Please complete the Excel sheet before uploading!', 6);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    // const handleSaveSection = async (grades: readonly Grade[]) => {
    //     console.log(grades)
    //     const addSection = async () => {
    //         const id = generateId('section');
    //         const { name, adviserId } = grades;
    //         const args = {
    //             id,
    //             name,
    //             adviserId,
    //         }
    //         const addSectionQuery = `
    //             mutation($id: String!, $name: String!, $adviserId: String!, $students: [UserInput!]!) {
    //                 addSection(id: $id, name: $name, adviserId: $adviserId, students: $students) {
    //                     name
    //                 }
    //             }
    //             `;

    //         fetch('http://localhost:4000/graphql', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json'
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({
    //                 query: addSectionQuery,
    //                 variables: args
    //             })
    //         })
    //             .then(res => res.json())
    //             .then(res => {
    //                 console.log(res);
    //             })
    //             .catch(err => console.log(err));
    //     }

    //     await addSection();
    //     setConfirmationModalIsVisible(false);
    //     message.success('Section and students are succesfully added', 5);

    //     // auto download excel file with passwords
    //     /* make the worksheet */
    //     var ws = XLSX.utils.json_to_sheet([...students]);
    //     /* add to workbook */
    //     var wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Students");
    //     /* write workbook */
    //     XLSX.writeFile(wb, `${sectionParams.name}-generated.xlsx`);
    // }

    return (
        <>
            <Link to={`/grade?classId=${classId}&quarter=${quarter}`}><Button icon={<ArrowLeftOutlined />}>Return To Grade</Button></Link>
            <h1></h1>
            <Form
                onFinish={() => setConfirmationModalIsVisible(true)}
            >
                <Form.Item
                    name='upload'
                    label='Upload'
                    valuePropName='fileList'
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Please upload a grades file!' }]}
                >
                    <input type='file' id='sectionFileUpload' name='sectionFileUpload' accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' onChange={handleFileUploadChange} />
                </Form.Item>

                <h2>Grade Preview:</h2>
                <DataTable
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
                            dataIndex: 'studentId',
                            key: 'student',
                            render: (studentId) => {
                                const student = _.find(students, student => {
                                    return student.id == studentId;
                                });
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
                />
                <Form.Item>
                    <Button type='primary' htmlType='submit' style={{ marginBottom: '10px' }}>Upload To Database</Button><br />
                </Form.Item>
            </Form>
            <ConfirmationModal
                visible={confirmationModalIsVisible}
                onConfirm={async () => {
                    // await handleSaveSection({
                    //     name: sectionName,
                    //     adviserId: selectedTeacherId
                    // },
                    //     students
                    // );
                }}
                onCancel={() => setConfirmationModalIsVisible(false)}
            />
        </>
    );
}
export default AddGrade;