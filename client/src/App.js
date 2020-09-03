import React, { useState, useContext } from 'react';
import Nav from './Nav';
import Coop from './Coop';
import Player from './Player';
import './App.css';
import { 
  BrowserRouter as Router, 
  Switch, 
  Route, 
  useHistory
} from 'react-router-dom';
import { GameContext } from './GameContext';
import { GameProvider } from './GameContext';


function App() {
  return (
    <div className="app-container">
      <Router>
        <Nav/>
        <Switch>
          <GameProvider>
          <Route path='/' exact component={GameIdForm} />
          
          <Route path='/:gameidurl' exact>
            <Coop />
          </Route>
          <Route path='/:gameidurl/player/:playerid'>
            <Player />
          </Route>
          </GameProvider>
        </Switch>
      </Router>
    </div>
    );
}

function GameIdForm() {
  const [gameId, setGameId] = useState('this-is-my-game');
  const [game, setGame] = useContext(GameContext);
  // const [gameId, setGameId] = gid;
  // const [game, setGame] = g;

  let history = useHistory();

  const handleSubmit = (event) => {
    event.preventDefault();
    history.push(`${gameId}`);
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

