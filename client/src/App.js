import React, { useState, useContext, useEffect } from 'react';
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

const nouns = ["cat", "dog", "narwhal", "larry"];
const verbs = ["lazy", "hungry", "zealous", "secret"];
const adverbs = ["super", "tensely", "weakly", "sickly"];

function arr_random(arr) {
  return(arr[Math.floor(Math.random()*arr.length)]);
}

function generateGameName() {
  return arr_random(adverbs) + "-" + arr_random(verbs) + "-" + arr_random(nouns);
}

console.log(generateGameName());

function App() {
  return (
      <Router>
        <Switch>
          <GameProvider>
            {/* <Nav/> */}
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

  const [gameId, setGameId] = useState(generateGameName());
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useContext(GameContext);
  const [playerId, setPlayerId] = useState(-1); 
  const [error, setError] = useState("");

  useEffect (() => {
    if (playerId >= 0) {
      console.log("playerId updated: ", playerId);
      window.location.href = `${gameId}/player/${playerId}`;
      history.push(`${gameId}/player/${playerId}`);

    }
  }, [playerId]);

console.log(playerId);
  let history = useHistory();
// TODO: Handle response from API if # player is not 2-6
  const createGame = async () => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"gameId": gameId, "playerName": playerName})
      };
  
      console.log("POST! creating game: ", game);
  
      const data = await fetch('/api/createGame', requestOptions);
      const gameFromAPI = await data.json();
      console.log("New game created!: ", gameFromAPI);
      // const playerId =  gameFromAPI.playerId + 1;

      setPlayerId(gameFromAPI.playerId + 1);
      if (gameFromAPI.error) {
        setError(gameFromAPI.error);
      }

      // setPlayerId(playerId);
      console.log("new player created!: ", gameFromAPI.playerId);
      
      return playerId;
    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  const handleSubmit = (event) => {
    event.preventDefault();
  
    createGame();
    // .then( function(playerId) {
    //   console.log("create game returned: ", playerId);
    //   // history.push(`${gameId}/player/${playerId}`);
    //   if (playerId >= 0) {
    //     window.location.href = `${gameId}/player/${playerId}`;
    //   }
    // });
  }


  
  return (
    <div class="home-container">
      <div class="home-content">
        <h1 className="home-title">COOP</h1>
        
        <form onSubmit={handleSubmit}>
        <div className="home-instruction">Coop can be played with 2-6 players across multiple devices.  To start a new game or go to an existing game, enter the game name, your name, and hit 'Go'.  Wait for you friends to enter the game before starting.</div>
        <div className="error">{error}</div>
          <span>Game Name:</span>
          <br></br>
          <input 
            type="text" 
            value={gameId}
            className="home-input"
            onChange={(event) => {setGameId(event.target.value)}}
          />
          <br></br>
          <span>Your Name:</span>
          <br></br>
          <input 
            type="text" 
            value={playerName}
            className="home-input"
            onChange={(event) => {setPlayerName(event.target.value)}}
          />
          <br></br>
          <button className="btn btn-default green" type="submit">Go</button>
        </form>
      </div>
    </div>
  );
}


export default App;

