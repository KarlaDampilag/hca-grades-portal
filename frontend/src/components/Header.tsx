import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import LogoutButton from './LogoutButton';

import { User } from '../interfaces';

const Header = () => {
    const [user, setUser] = React.useState<User>();
    const [selectedKey, setSelectedKey] = React.useState<string>('');

    React.useEffect(() => {
        const query = `
        query {
            me {
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
                setUser(res.data.me);
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <div id='header'>
            <Menu
                mode='horizontal'
                selectedKeys={[selectedKey]}
                onClick={(e) => {
                    setSelectedKey(e.key.toString());
                }}
            >
                {
                    user ?
                        <>
                            {
                                user.role.type == 'admin' &&
                                <>
                                    <Menu.Item key='classes'><Link to='/classes'>Classes</Link></Menu.Item>
                                    <Menu.Item key='grades'><Link to='/grades'>Grades</Link></Menu.Item>
                                    <Menu.Item key='sections'><Link to='/sections'>Sections</Link></Menu.Item>
                                    <Menu.Item key='teachers'><Link to='/teachers'>Teachers</Link></Menu.Item>
                                    <Menu.Item key='users'><Link to='/users'>Users</Link></Menu.Item>
                                </>
                            }
                            {
                                user.role.type == 'schoolAdmin' &&
                                <>
                                    <Menu.Item key='sections'><Link to='/sections'>Sections</Link></Menu.Item>
                                    <Menu.Item key='teachers'><Link to='/teachers'>Teachers</Link></Menu.Item>
                                </>
                            }
                            {
                                user.role.type == 'teacher' &&
                                <>
                                    <Menu.Item key='sections'><Link to='/sections'>Sections</Link></Menu.Item>
                                </>
                            }
                            {
                                user.role.type == 'student' &&
                                <>
                                    <Menu.Item key='classes'><Link to='/classes'>Classes</Link></Menu.Item>
                                    <Menu.Item key='grade'><Link to='/grade'>Grade</Link></Menu.Item>
                                </>
                            }
                            <Menu.Item><LogoutButton /></Menu.Item>
                            <span style={{ position: 'absolute', right: 0, paddingRight: '20px' }}>{`Welcome, ${user.firstName} ${user.lastName}!`}</span>
                        </> :
                        <>
                            <Menu.Item><Link to="/signup">Sign Up</Link></Menu.Item>
                            <Menu.Item><Link to="/login">Log In</Link></Menu.Item>
                        </>
                }
            </Menu>
        </div>
    );
}

export default Header;
