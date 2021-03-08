import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import { MyContext } from './../App';
import LogoutButton from './LogoutButton';

const Header = () => {
    const context = React.useContext(MyContext);
    const { user } = context;
    const [selectedKey, setSelectedKey] = React.useState<string>('');

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
                                    <Menu.Item key='sections'><Link to='/sections'>Sections</Link></Menu.Item>
                                    <Menu.Item key='classes'><Link to='/classes'>Classes</Link></Menu.Item>
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
                                    <Menu.Item key='classes'><Link to='/classes'>Classes</Link></Menu.Item>
                                </>
                            }
                            {
                                user.role.type == 'student' &&
                                <>
                                    <Menu.Item key='studentClasses'><Link to='/studentClasses'>Classes</Link></Menu.Item>
                                    <Menu.Item key='grade'><Link to='/grade'>Grade</Link></Menu.Item>
                                </>
                            }
                            <LogoutButton />
                            <span id='welcome'>{`Welcome, ${user.firstName} ${user.lastName}!`}</span>
                        </> :
                        <>
                            {/* <Menu.Item key='signup'><Link to="/signup">Sign Up</Link></Menu.Item> */}
                            <Menu.Item key='login'><Link to="/login">Log In</Link></Menu.Item>
                        </>
                }
            </Menu>
        </div>
    );
}

export default Header;
