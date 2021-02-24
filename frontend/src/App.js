import React from 'react';
import './App.css';

import {
  Switch,
  Route
} from "react-router-dom";

import Users from './views/admin/Users.tsx';
import AddUser from './views/admin/AddUser.tsx';
import Sections from './views/schoolAdmin/Sections.tsx';
import AddSection from './views/schoolAdmin/AddSection.tsx';
import Teachers from './views/schoolAdmin/Teachers.tsx';
import AddTeacher from './views/schoolAdmin/AddTeacher.tsx';
import Home from './views/Home.tsx';
import Header from './components/Header';

import { Card } from 'antd';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
      </header>
      <div className='App-body'>
        <Card>
          <Switch>
            <Route path='/sections' component={Sections} />
            <Route path='/addSection' component={AddSection} />
            <Route path='/users' component={Users} />
            <Route path='/addUser' component={AddUser} />
            <Route path='/teachers' component={Teachers} />
            <Route path='/addTeacher' component={AddTeacher} />
            <Route path='/' component={Home} />
          </Switch>
        </Card>
      </div>
    </div>
  );
}

export default App;
