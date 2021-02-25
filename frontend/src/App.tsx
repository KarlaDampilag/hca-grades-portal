import React from 'react';
import './App.css';

import {
  Switch,
  Route
} from "react-router-dom";

import { Card } from 'antd';

import Users from './views/admin/Users';
import AddUser from './views/admin/AddUser';
import Sections from './views/schoolAdmin/Sections';
import AddSection from './views/schoolAdmin/AddSection';
import Teachers from './views/schoolAdmin/Teachers';
import AddTeacher from './views/schoolAdmin/AddTeacher';
import Home from './views/Home';
import Header from './components/Header';

import { User } from './interfaces';

function App() {
  const [user, setUser] = React.useState<User>();

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
    <div className="App">
      <header className="App-header">
        <Header user={user} />
      </header>
      <div className='App-body'>
        <Card>
          {user ?
            <>
              <Switch>
                <Route path='/sections' component={Sections} />
                <Route path='/addSection' component={AddSection} />
                <Route path='/users' component={Users} />
                <Route path='/addUser' component={AddUser} />
                <Route path='/teachers' component={Teachers} />
                <Route path='/addTeacher' component={AddTeacher} />
                <Route path='/' component={Home} />
              </Switch>
            </> : <>
              <p>Please log in to use this application.</p>
            </>
          }
        </Card>
      </div>
    </div>
  );
}

export default App;
