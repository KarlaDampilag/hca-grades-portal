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
import Login from './views/universal/Login';
import Header from './components/Header';

import { User } from './interfaces';

function App() {
  const [user, setUser] = React.useState<User>();

  React.useEffect(() => {
    const query = `
    query {
        me {
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
        setUser(res.data.me);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <MyContext.Provider value={{
      user: user
    }}>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <div className='App-body'>
          <Card>
            <Switch>
              <Route path='/login' component={() => <Login />} />
              {user ?
                <>
                  <Route path='/sections' component={Sections} />
                  <Route path='/addSection' component={AddSection} />
                  <Route path='/users' component={Users} />
                  <Route path='/addUser' component={AddUser} />
                  <Route path='/teachers' component={Teachers} />
                  <Route path='/addTeacher' component={AddTeacher} />
                </> : <>
                  <p>Please log in to use this application.</p>
                </>
              }
            </Switch>
          </Card>
        </div>
      </div>
    </MyContext.Provider>
  );
}

export default App;

export const MyContext = React.createContext<{
  user: User | undefined
}>({
  user: undefined
});