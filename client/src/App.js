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
      <Router>
        <Switch>
          <GameProvider>
            <Nav/>
            <Route path='/' exact component={GameIdForm} />
            <Route path='/:gameidURL' exact>
              <Coop />
            </Route>
            <Route path='/:gameidURL/player/:playeridURL'>
              <Player />
            </Route>
          </GameProvider>
        </Switch>
      </Router>
    );
}

function GameIdForm() {
  const [gameId, setGameId] = useState('this-is-my-game');
  const [numPlayers, setNumPlayers] = useState(3);
  const [game, setGame] = useContext(GameContext);
  // const [gameId, setGameId] = gid;
  // const [game, setGame] = g;

  let history = useHistory();
// TODO: Handle response from API if # player is not 2-6
  const createGame = async () => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"gameId": gameId, "numPlayers": numPlayers})
      };
  
      console.log("POST! posting game: ", game);
  
      const data = await fetch('/api/createGame', requestOptions);
      const gameFromAPI = await data.json();
  
      console.log("New game created!: ", gameFromAPI);
  
    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  const handleSubmit = (event) => {
    event.preventDefault();
    createGame();
    history.push(`${gameId}`);
  }
  
  return (
    <div class="home-container">
      <div class="home-content">
        <h1 className="home-title">COOP</h1>
        
        <form onSubmit={handleSubmit}>
        <div className="home-instruction">Coop can be played with 2-6 players across multiple devices.  To start a new game enter the game name, the number of players, and hit 'Go'. To enter an existing game enter the game name and hit 'Go'</div>
          <span>Game Name:</span>
          <br></br>
          <input 
            type="text" 
            value={gameId}
            className="home-input"
            onChange={(event) => {setGameId(event.target.value)}}
          />
          <br></br>
          <span>Number of Players:</span>
          <br></br>
          <input 
            type="text" 
            value={numPlayers}
            className="home-input"
            onChange={(event) => {setNumPlayers(event.target.value)}}
          />
          <br></br>
          <button className="btn btn-default green" type="submit">Go</button>
        </form>
      </div>
    </div>
  );
}


export default App;

