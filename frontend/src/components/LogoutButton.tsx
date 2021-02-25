import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';

const LogoutButton = () => {
    const history = useHistory();

    const logout = async () => {
        const query = `
        mutation {
                logout
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
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    return (
        <Button
            onClick={async () => {
                await logout();
                window.location.reload();
                // history.push('/');
            }}
        >
            Logout
        </Button>
    );
}

export default LogoutButton;