import React from 'react';
import { Button } from 'antd';

const LogoutButton = () => {

    const logout = async () => {
        const query = `
        mutation {
                logout
            }
        `;

        fetch(`${process.env.REACT_APP_SERVER_URL}/graphql`, {
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
            .then(() => window.location.reload())
            .catch(err => console.log(err));
    }

    return (
        <Button
            onClick={async () => {
                await logout();
            }}
        >
            Logout
        </Button>
    );
}

export default LogoutButton;