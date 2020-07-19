import React, { useState } from 'react';
import Nav from './Nav';
import Coop from './Coop';
import Player from './Player';
import './App.css';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';


function App() {
  return (
    <div className="app-container">
      <Router>
        <Nav/>
        <Switch>
          <Route path='/' exact component={GameIdForm} />
          <Route path='/:gameid' exact component={Coop} />
          <Route path='/:gameid/player/:id' component={Player} />
        </Switch>
      </Router>
    </div>
    );
}

function GameIdForm() {
  const [gameId, setGameId] = useState('this-is-my-game');
  let history = useHistory();

  const handleSubmit = (event) => {
    event.preventDefault();
    history.push(`${gameId}`)
  }

  const handleChange = (event) => {
    setGameId(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={gameId}
        onChange={(event) => {setGameId(event.target.value)}}
      />
    </form>
  );
}


export default App;

