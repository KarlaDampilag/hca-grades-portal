import React from 'react';
import * as _ from 'lodash';
import { Button, Modal, Form, Select, Input, message } from 'antd';

import { User, Section } from '../interfaces';
import { MyContext } from './../App';
import { generateId } from '../utils/utils';

interface Properties {
    sectionId?: string
}

const AddClassModal = (props: Properties) => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [sections, setSections] = React.useState<readonly Section[]>();
    const [isVisible, setIsVisible] = React.useState<boolean>(false);
    const [teachers, setTeachers] = React.useState<readonly User[]>();
    const [className, setClassName] = React.useState<string>();
    const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>();
    const [selectedSectionId, setSelectedSectionId] = React.useState<string>();

    React.useEffect(() => {
        if (user) {
            const sectionsQuery = `
            query {
                sections {
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
                    query: sectionsQuery,
                })
            })
                .then(res => res.json())
                .then(res => {
                    if (res.errors) {
                        message.error(res.errors[0].message, 7);
                    } else {
                        setSections(res.data.sections);
                    }
                })
                .catch(err => console.log(err));
        }

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

        if (user?.role.type == 'admin' || user?.role.type == 'schoolAdmin') {
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
                    if (res.errors) {
                        message.error(res.errors[0].message, 7);
                    } else {
                        setTeachers(_.sortBy(res.data.users, 'lastName'));
                    }
                })
                .catch(err => console.log(err));
        }

        // set default section
        if (props.sectionId) {
            setSelectedSectionId(props.sectionId);
        }

        // set default teacher
        setSelectedTeacherId(getDefaultTeacherValue());
    }, [props.sectionId]);

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    };
    const tailLayout = {
        wrapperCol: { offset: 4, span: 20 },
    };

    const handleSave = async () => {
        const id = generateId('class');
        const args = {
            id,
            name: className,
            teacherId: selectedTeacherId,
            sectionId: selectedSectionId
        }

        const query = `
        mutation($id: String!, $name: String, $teacherId: String!, $sectionId: String!) {
            addClass(id: $id, name: $name, teacherId: $teacherId, sectionId: $sectionId) {
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
                query,
                variables: args
            })
        })
            .then(res => res.json())
            .then(res => {
                setIsVisible(false);
                window.location.reload();
            })
            .catch(err => console.log(err));
    }

    const getDefaultTeacherValue = () => {
        if (user && user.role && user.role.type == 'teacher') {
            return user.id;
        } else {
            return undefined;
        }
    }

    return (
        <>
            <Modal
                visible={isVisible}
                title='Add a Class'
                footer={[]}
                width='600px'
                onCancel={() => setIsVisible(false)}
                maskClosable={false}
            >
                <Form
                    {...layout}
                    onFinish={handleSave}
                >
                    <Form.Item
                        label="Section"
                        name="section"
                        rules={[{ required: true, message: 'Please select a section!' }]}
                        initialValue={selectedSectionId}
                    >
                        <Select
                            value={selectedSectionId}
                            onChange={(value: string) => setSelectedSectionId(value)}
                            placeholder='select a section...'
                        >
                            {
                                _.map(sections, section => {
                                    return <Select.Option value={section.id} key={section.id}>{section.name}</Select.Option>
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Teacher"
                        name="teacher"
                        rules={[{ required: true, message: 'Please select a teacher!' }]}
                        initialValue={selectedTeacherId}
                    >
                        <Select
                            value={selectedTeacherId}
                            onChange={(value: string) => setSelectedTeacherId(value)}
                            placeholder='select a teacher...'
                        >
                            {
                                user && user.role && user.role.type == 'teacher' ?
                                    <Select.Option value={user.id} key={user.id}>{`${user.lastName}, ${user.firstName} ${user.middleInitial}`}</Select.Option> :
                                    _.map(teachers, teacher => {
                                        return <Select.Option value={teacher.id} key={teacher.id}>{`${teacher.lastName}, ${teacher.firstName} ${teacher.middleInitial}`}</Select.Option>
                                    })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Class name"
                        name="className"
                        rules={[{ required: true, message: 'Please input a class name!' }]}
                    >
                        <Input onChange={(e) => setClassName(e.target.value)} placeholder='input a name...' />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" className='form-submit'>
                            Add To Database
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button type='primary' onClick={() => setIsVisible(true)}>Add Class</Button>
        </>
    );
}

export default AddClassModal;
