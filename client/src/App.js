import React from 'react';
import Nav from './Nav';
import Coop from './Coop';
import Player from './Player';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';


function App() {
  return (
    <div className="app-container">
      <Router>
        <Nav/>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/:gameid' exact component={Coop} />
          <Route path='/:gameid/player/:id' component={Player} />
        </Switch>
      </Router>
    </div>
    );
}

const Home = () => (
  <div>
    <h1>Home</h1>
  </div>
);


export default App;

