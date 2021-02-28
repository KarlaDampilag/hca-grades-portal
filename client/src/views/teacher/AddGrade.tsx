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

    const urlQuery = new URLSearchParams(props.location.search);
    const classId = urlQuery.get('classId');
    const quarter = urlQuery.get('quarter');

    React.useEffect(() => {

        
    }, []);

    const normFile = (event) => {
        if (event && event.target && event.target.files) {
            return event.target.files[0]
        }
    };

    const getStudentIdFromLRN = (lrn: string): string => {
        return '';
    }

    const transformGradesFromUpload = (jsonObject): Grade => {
        const id = generateId('grade');
        const studentId: string = getStudentIdFromLRN(jsonObject.lrn);
        const scores = {};

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
                            title: 'Student',
                            dataIndex: 'studentId',
                            key: 'student'
                        },
                        {
                            title: 'Class',
                            dataIndex: 'classId',
                            key: 'class'
                        },
                        {
                            title: 'Quarter',
                            dataIndex: 'quarter',
                            key: 'quarter'
                        }
                    ]}
                />
                <Form.Item>
                    <Button type='primary' htmlType='submit' style={{ marginBottom: '10px' }}>Upload To Database</Button><br />
                    <Link to='/sections'><Button icon={<ArrowLeftOutlined />}>Return To Sections</Button></Link>
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