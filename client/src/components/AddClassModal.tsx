import React from 'react';
import * as _ from 'lodash';
import { Button, Modal, Form, Select, Input, message } from 'antd';

import { User, Section } from '../interfaces';
import { MyContext } from './../App';
import { generateId } from '../utils/utils';

interface Properties {
    section: Section | undefined
}

const AddClassModal = (props: Properties) => {
    const context = React.useContext(MyContext);
    const { user } = context;

    const [isVisible, setIsVisible] = React.useState<boolean>(false);
    const [teachers, setTeachers] = React.useState<readonly User[]>();
    const [className, setClassName] = React.useState<string>();
    const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>();

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
    }, []);

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
            sectionId: props.section?.id
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
                    <b><p>Section: {props.section?.name}</p></b>

                    <Form.Item
                        label="Class name"
                        name="className"
                        rules={[{ required: true, message: 'Please input a class name!' }]}
                    >
                        <Input onChange={(e) => setClassName(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label="Teacher"
                        name="teacher"
                        rules={[{ required: true, message: 'Please select a teacher!' }]}
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
