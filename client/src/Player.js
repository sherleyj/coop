import React, { 
  useState,
  useEffect,
} from 'react';import './App.css';
import { 
  useParams,
  Link,
} from "react-router-dom";

function Player() {

  console.log("****** new render ******")

  const { gameidurl, playerid } = useParams(); 
  const [gameId, setGameId] = useState(gameidurl);
  const [game, setGame] = useState({});
  
  
  useEffect (() => {
    if (Object.entries(game).length === 0) {
      getGameAPI();
    } else {
      setGameAPI();
    }
  }, [game]);

  const getGameAPI = async () => {
    try {
        const data = await fetch(
            'http://localhost:9000/game/' + gameId
        );

        const gameFromAPI = await data.json(); 
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        })

        console.log("getGame, gameFromAPI:", gameFromAPI)
    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  const setGameAPI = async () => {
    try {
        console.log("POST!");
    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  
  
  function income(e) {
    e.preventDefault();
    // if (game.players[playerid-1]) {
      const coins = game.players[playerid-1].coins + 1;
      game.players[playerid-1].coins = coins;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid-1].coins );
      console.log("Checking characters: ", game.characters[0].name);
    // }
  }

  const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
  }
  
  let coins = getNestedObject(game, ['players', playerid-1, 'coins']);
  console.log("coins: ", coins);

  return (
    <div>
      <h1>Player Page {playerid}</h1>
     
        {coins}
        <button onClick={income}>Collect Income</button>
        {/* <button onClick={this.aide}>Collect Foreign Aide</button>
        <button onClick={this.coop}>Coop!</button> */}
    </div>
  );
  
}

export default Player;

