import React from 'react';
import { Link } from 'react-router-dom'
import { Input, Form, Button, message, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

import { generateId, generateUsername, generatePassword } from '../../utils/utils';
import { User } from '../../interfaces';

import DataTable from '../../components/DataTable';
import ConfirmationModal from '../../components/ConfirmationModal';

interface teacherParams {
    firstName: string,
    lastName: string,
    middleInitial: string,
    email: string,
    password: string,
    role: {
        type: string,
        indexInSheet?: string
    }
}

interface teacher extends teacherParams {
    id: string
}

const AddTeacher = () => {
    const [teachers, setTeachers] = React.useState<readonly teacher[]>([]);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] = React.useState<boolean>(false);

    const normFile = (event) => {
        if (event && event.target && event.target.files) {
            return event.target.files[0]
        }
    };

    const transformTeacherFromSectionUpload = (jsonObject): teacher => {
        const id = generateId('teacher');
        const nameArr: string[] = jsonObject.name.split(',');
        const lastName = nameArr[0];
        const nameArr2 = nameArr[1].trim().split(' ');
        
        let firstName = '';
        for (let i = 0; i < nameArr2.length - 1; i++) {
            firstName = firstName.concat(` ${nameArr2[i]}`);
        }

        const middleInitial = nameArr2[nameArr2.length-1];
        const userName = generateUsername(jsonObject.index, firstName, lastName);
        const password = generatePassword();

        return {
            id,
            firstName,
            lastName,
            middleInitial,
            email: userName,
            password,
            role: {
                type: 'teacher',
                indexInSheet: jsonObject.index
            }
        };
    }

    const handleFileUploadChange = (event) => {
        const files = event.target.files
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => { // TODO break into smaller functions!
            if (e && e.target && e.target.result) {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_json(ws, { blankrows: false });
                const filteredData = _.filter(data, jsonObject => {
                    if (jsonObject.index) {
                        return jsonObject;
                    }
                });

                let sheetIsValid = true;
                const newTeachers: teacher[] = [];
                for (const jsonObject of filteredData) {
                    if (jsonObject.index && jsonObject.name) {
                        const newTeacherObj: teacher = transformTeacherFromSectionUpload(jsonObject);
                        newTeachers.push(newTeacherObj);
                    } else {
                        sheetIsValid = false;
                    }
                };
                if (sheetIsValid) {
                    setTeachers(newTeachers);
                } else {
                    message.error('Some teacher fields are not filled in. Please complete the Excel sheet before uploading!', 6);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSaveSection = async (teachers: readonly teacher[]) => {
        const normalizedTeachers: teacher[] = [];
        const teachersCopy = [...teachers];
        for (const teacher of teachersCopy) {
            const teacherCopy = {...teacher};
            delete teacherCopy.role.indexInSheet;
            normalizedTeachers.push(teacherCopy);
        }

        const addTeachers = async () => {
            const addTeacherQuery = `
                mutation($users: [UserInput!]!) {
                    addUsers(users: $users) {
                        firstName
                        lastName
                        email
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
                    query: addTeacherQuery,
                    variables: { users: normalizedTeachers }
                })
            })
                .then(res => res.json())
                .then(res => {
                    console.log(res);
                })
                .catch(err => console.log(err));
        }

        await addTeachers();
        setConfirmationModalIsVisible(false);
        message.success('Teachers are succesfully added', 5);

        // auto download excel file with passwords
        /* make the worksheet */
        var ws = XLSX.utils.json_to_sheet([...teachers]);
        /* add to workbook */
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teachers");
        /* write workbook */
        XLSX.writeFile(wb, "Teachers-generated.xlsx");
    }

    const layout = {
        labelCol: { span: 3 },
        wrapperCol: { span: 21 },
    };

    return (
        <>
            <Link to='/teachers'><Button icon={<ArrowLeftOutlined />}>Return To Teachers</Button></Link>
            <h1>Upload Teachers</h1>
            <Form
                onFinish={() => setConfirmationModalIsVisible(true)}
                {...layout}
            >
                <Form.Item
                    name='upload'
                    label='Upload'
                    valuePropName='fileList'
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Please upload a teachers file!' }]}
                >
                    <input type='file' id='teachersFileUpload' name='teachersFileUpload' accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' onChange={handleFileUploadChange} />
                </Form.Item>

                <h2>Teachers Preview:</h2>
                <DataTable
                    data={teachers}
                    pagination={{ pageSize: 50 }}
                    columns={[
                        {
                            title: 'Index',
                            dataIndex: 'role',
                            key: 'index',
                            render: (role) => {
                                return role.indexInSheet;
                            },
                            width: 50
                        },
                        {
                            title: 'Name',
                            dataIndex: 'lastName',
                            key: 'fullName',
                            render: (lastName, user) => {
                                let fullName = `${lastName}, ${user.firstName}`;
                                if (user.middleInitial) {
                                    fullName = fullName.concat(` ${user.middleInitial}`);
                                }
                                return fullName;
                            },
                            width: 300
                        },
                        {
                            title: 'Username',
                            dataIndex: 'email',
                            key: 'email'
                        },
                        {
                            title: 'Password',
                            dataIndex: 'password',
                            key: 'password'
                        }
                    ]}
                />
                <Form.Item>
                    <Button type='primary' htmlType='submit' style={{ marginBottom: '10px' }}>Upload To Database</Button><br />
                    <Link to='/teachers'><Button icon={<ArrowLeftOutlined />}>Return To Teachers</Button></Link>
                </Form.Item>
            </Form>
            <ConfirmationModal
                visible={confirmationModalIsVisible}
                onConfirm={async () => {
                    await handleSaveSection(teachers);
                }}
                onCancel={() => setConfirmationModalIsVisible(false)}
            />
        </>
    );
}

export default AddTeacher;
