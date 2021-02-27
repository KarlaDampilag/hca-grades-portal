import React from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

import { MyContext } from './../../App';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
const tailLayout = {
    wrapperCol: { offset: 4, span: 20 },
};

const Login = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    
    const history = useHistory();

    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();

    React.useEffect(() => {
        if (user) {
            history.push('/');
        }
    }, [user, history]);

    const handleFormSubmit = async () => {
        const query = `
        mutation($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                email
                password
            }
        }
        `;

        const args = {
            email,
            password
        }

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
                if (res.errors) {
                    message.error(res.errors[0].message, 5);
                }
                if (res && res.data && res.data.login) {
                    window.location.reload();
                }
            })
    }

    return (
        <>
            <Form
                {...layout}
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
                onFinish={handleFormSubmit}
            >
                <h1>Login</h1>
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input onChange={(e) => setEmail(e.target.value)} />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password onChange={(e) => setPassword(e.target.value)} />
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit" className='form-submit'>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default Login;
