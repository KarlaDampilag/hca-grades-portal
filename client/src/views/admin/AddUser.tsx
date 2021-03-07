import React from 'react';
import { Link } from 'react-router-dom'
import { Button, Form, Input, Radio, message } from 'antd';
import { Role } from '../../interfaces';
import { generateId } from '../../utils/utils';

interface Properties { }

const AddUser = (props: Properties) => {
    const [firstName, setFirstName] = React.useState<string>();
    const [lastName, setLastName] = React.useState<string>();
    const [middleInitial, setMiddleInitial] = React.useState<string>();
    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();
    const [confirmPassword, setConfirmPassword] = React.useState<string>();
    const [role, setRole] = React.useState<string>();

    const [form] = Form.useForm();
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    };
    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };

    const validatePassword = (password, confirmPassword): {
        isValid: boolean,
        errMessage?: string
    } => {
        let returnValue = {
            isValid: false
        }

        const specialCharacters = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

        if (password !== confirmPassword) {
            returnValue['errMessage'] = `Passwords don't match!`;
        } else if (password.length < 8 || !specialCharacters.test(password)) {
            returnValue['errMessage'] = `Password must be at least 8 characters and contain a special character`;
        } else {
            returnValue.isValid = true;
        }

        return returnValue;
    }

    const onFormFinish = (values) => {
        const passwordCheckResult = validatePassword(values.password, values.confirmPassword);
        if (passwordCheckResult.isValid) {
            const role = {
                type: values.role
            }; // TODO currently hardcoded, add generator based on user input
            addUser({
                firstName: values.firstName,
                lastName: values.lastName,
                middleInitial: values.middleInitial,
                email: values.email,
                password: values.password,
                role: role
            });
        } else {
            message.error(passwordCheckResult.errMessage, 5);
        }
    }

    const addUser = (args: {
        firstName: string,
        lastName: string,
        middleInitial?: string,
        email: string,
        password: string,
        role: Role
    }) => {
        const { firstName, lastName, middleInitial, email, password, role } = args;
        const id = generateId('user');
        const user = {
            id,
            firstName,
            lastName,
            middleInitial,
            email,
            password,
            role
        };
        const query = `
            mutation($id: String!, $firstName: String!, $lastName: String!, $middleInitial: String, $email: String!, $password: String!, $role: Object!) {
                addUser(id: $id, firstName: $firstName, lastName: $lastName, middleInitial: $middleInitial, email: $email, password: $password, role: $role) {
                    firstName,
                    lastName,
                    middleInitial,
                    email,
                    role
                }
            }
        `;

        fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                query,
                variables: user
            })
        })
            .then(res => res.json())
            .then(res => {
                message.success('User successfully added', 5);
                form.resetFields();
            })
            .catch(err => console.log(err));
    }

    return (
        <>
            <Form
                {...layout}
                form={form}
                onFinish={onFormFinish}
            >
                <Form.Item
                    label='First Name'
                    name='firstName'
                    rules={[{ required: true, message: 'Please input first name!' }]}
                >
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Last Name'
                    name='lastName'
                    rules={[{ required: true, message: 'Please input last name!' }]}
                >
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Middle Initial'
                    name='middleInitial'
                >
                    <Input value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Email'
                    name='email'
                    rules={[{ required: true, message: 'Please input email!' }]}
                >
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Password'
                    name='password'
                    rules={[{ required: true, message: 'Please input password!' }]}
                >
                    <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Confirm Password'
                    name='confirmPassword'
                    rules={[{ required: true, message: 'Please input confirm password!' }]}
                >
                    <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label='Role'
                    name='role'
                    rules={[{ required: true, message: 'Please choose a role!' }]}
                >
                    <Radio.Group
                        optionType='button'
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <Radio.Button value={'admin'}>ADMIN</Radio.Button>
                        <Radio.Button value={'schoolAdmin'}>SCHOOL ADMIN</Radio.Button>
                        <Radio.Button value={'teacher'}>TEACHER</Radio.Button>
                        <Radio.Button value={'student'}>STUDENT</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    {...tailLayout}
                >
                    <Button type='primary' htmlType='submit' style={{ marginBottom: '10px' }} block>Add User</Button>
                    <Link
                        to='/users'
                        style={{ display: 'block' }}
                    >
                        <Button block>Back To Users</Button>
                    </Link>
                </Form.Item>
            </Form>

        </>
    )
}

export default AddUser;