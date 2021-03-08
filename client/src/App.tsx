import React from 'react';
import './App.css';

import {
  Switch,
  Route,
  useHistory
} from "react-router-dom";

import { Card, Spin } from 'antd';

import Users from './views/admin/Users';
import AddUser from './views/admin/AddUser';
import Sections from './views/schoolAdmin/Sections';
import AddSection from './views/schoolAdmin/AddSection';
import Teachers from './views/schoolAdmin/Teachers';
import AddTeacher from './views/schoolAdmin/AddTeacher';
import Login from './views/universal/Login';
import SectionView from './views/teacher/Section';
import GradeView from './views/teacher/GradeView';
import AddGrade from './views/teacher/AddGrade';
import FinalGrades from './views/teacher/FinalGrades';
import Classes from './views/teacher/Classes';
import Header from './components/Header';
import StudentClasses from './views/student/StudentClasses';

import { User } from './interfaces';

function App() {
  const history = useHistory();

  const [user, setUser] = React.useState<User>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

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
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className='spin-container'>
        <Spin size='large' tip="Loading..."></Spin>
      </div>
    );
  }

  return (
    <MyContext.Provider value={{
      user: user
    }}>
      {!user && history.push('/login')}

      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <div className='App-body'>
          <Card>
            <Switch>
              <Route path='/login' component={() => <Login />} />
              <Route path='/sections' component={Sections} />
              <Route path='/section' component={SectionView} />
              <Route path='/addSection' component={AddSection} />
              <Route path='/classes' component={Classes} />
              <Route path='/grade' component={GradeView} />
              <Route path='/addGrade' component={AddGrade} />
              <Route path='/finalGrades' component={FinalGrades} />
              <Route path='/users' component={Users} />
              <Route path='/addUser' component={AddUser} />
              <Route path='/teachers' component={Teachers} />
              <Route path='/addTeacher' component={AddTeacher} />
              <Route path='/studentClasses' component={StudentClasses} />
              {user && user.role.type == 'student' ? <Route exact path='/' component={StudentClasses} /> : <Route exact path='/' component={Classes} />}
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