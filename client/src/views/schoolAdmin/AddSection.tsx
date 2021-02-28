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

import { MyContext } from './../../App';

interface sectionParams {
    name: string,
    adviserId: string
}

interface studentParams {
    firstName: string,
    lastName: string,
    middleInitial: string,
    email: string,
    password: string,
    role: {
        type: string,
        lrn: string
    }
}

interface student extends studentParams {
    id: string
}

const AddSection = () => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [teachers, setTeachers] = React.useState<readonly User[]>();
    const [sectionName, setSectionName] = React.useState<string>('');
    const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('');
    const [students, setStudents] = React.useState<readonly student[]>([]);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] = React.useState<boolean>(false);

    React.useEffect(() => {
        const query = `
        query {
            users(filter: {role: {type: "teacher"}}) {
                id
                firstName
                lastName
                middleInitial
                email
                role
            }
        }
        `;

        if (user?.role.type == 'teacher') {
            const holder: User[] = [];
            holder.push(user);
            setTeachers(holder);
        } else {
            fetch('http://localhost:4000/graphql', {
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
                    setTeachers(_.sortBy(res.data.users, 'lastName'));
                })
                .catch(err => console.log(err));
        }
    }, []);

    const normFile = (event) => {
        if (event && event.target && event.target.files) {
            return event.target.files[0]
        }
    };

    const transformStudentFromSectionUpload = (jsonObject): student => {
        const id = generateId('student');
        const nameArr: string[] = jsonObject.name.split(',');
        const lastName = nameArr[0];
        const nameArrElement2 = nameArr[1];
        const firstName = nameArrElement2.slice(1, nameArrElement2.length - 3);
        const middleInitial = nameArrElement2.charAt(nameArrElement2.length - 2);
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
                type: 'student',
                lrn: jsonObject.lrn.toString()
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
                const newStudents: student[] = [];
                for (const jsonObject of filteredData) {
                    if (jsonObject.name && jsonObject.lrn) {
                        const newStudentObj: student = transformStudentFromSectionUpload(jsonObject);
                        newStudents.push(newStudentObj);
                    } else {
                        sheetIsValid = false;
                    }
                };
                if (sheetIsValid) {
                    setStudents(newStudents);
                } else {
                    message.error('Some student fields are not filled in. Please complete the Excel sheet before uploading!', 6);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSaveSection = async (sectionParams: sectionParams, students: readonly student[]) => {
        const addSection = async () => {
            const id = generateId('section');
            const { name, adviserId } = sectionParams;
            const args = {
                id,
                name,
                adviserId,
                students
            }
            const addSectionQuery = `
                mutation($id: String!, $name: String!, $adviserId: String!, $students: [UserInput!]!) {
                    addSection(id: $id, name: $name, adviserId: $adviserId, students: $students) {
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
                    query: addSectionQuery,
                    variables: args
                })
            })
                .then(res => res.json())
                .then(res => {
                    console.log(res);
                })
                .catch(err => console.log(err));
        }

        await addSection();
        setConfirmationModalIsVisible(false);
        message.success('Section and students are succesfully added', 5);

        // auto download excel file with passwords
        /* make the worksheet */
        var ws = XLSX.utils.json_to_sheet([...students]);
        /* add to workbook */
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        /* write workbook */
        XLSX.writeFile(wb, `${sectionParams.name}-generated.xlsx`);
    }


    const layout = {
        labelCol: { span: 3 },
        wrapperCol: { span: 21 },
    };

    return (
        <>
            <Link to='/sections'><Button icon={<ArrowLeftOutlined />}>Return To Sections</Button></Link>
            <h1>Add A Section</h1>
            <Form
                onFinish={() => setConfirmationModalIsVisible(true)}
                {...layout}
            >
                <Form.Item
                    label='Section Name'
                    name='sectionName'
                    rules={[{ required: true, message: 'Please input a section name!' }]}
                >
                    <Input value={sectionName} onChange={(e) => setSectionName(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Adviser'
                    name='adviser'
                    rules={[{ required: true, message: 'Please choose an adviser!' }]}
                >
                    <Select
                        onChange={(value: string) => setSelectedTeacherId(value)}
                    >
                        {
                            _.map(teachers, teacher => {
                                return <Select.Option value={teacher.id} key={teacher.id}>{`${teacher.lastName}, ${teacher.firstName} ${teacher.middleInitial}`}</Select.Option>
                            })
                        }
                    </Select>
                </Form.Item>

                <Form.Item
                    name='upload'
                    label='Upload'
                    valuePropName='fileList'
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: 'Please upload a section file!' }]}
                >
                    <input type='file' id='sectionFileUpload' name='sectionFileUpload' accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' onChange={handleFileUploadChange} />
                </Form.Item>

                <h2>Students Preview:</h2>
                <DataTable
                    data={students}
                    columns={[
                        {
                            title: 'Name',
                            dataIndex: 'lastName',
                            key: 'fullName',
                            render: (lastName, user) => {
                                let fullName = `${lastName}, ${user.firstName}`;
                                if (user.middleInitial) {
                                    fullName = fullName.concat(` ${user.middleInitial}.`);
                                }
                                return fullName;
                            }
                        },
                        {
                            title: 'Email',
                            dataIndex: 'email',
                            key: 'email'
                        },
                        {
                            title: 'LRN',
                            dataIndex: 'role',
                            key: 'lrn',
                            render: (role) => {
                                return role.lrn;
                            }
                        },
                        {
                            title: 'Password',
                            dataIndex: 'password',
                            key: 'password',
                            render: (password) => {
                                return password;
                            }
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
                    await handleSaveSection({
                        name: sectionName,
                        adviserId: selectedTeacherId
                    },
                        students
                    );
                }}
                onCancel={() => setConfirmationModalIsVisible(false)}
            />
        </>
    );
}
export default AddSection;