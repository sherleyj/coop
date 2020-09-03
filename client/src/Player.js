import React, { 
  useState,
  useEffect,
  useContext,
} from 'react';import './App.css';
import { 
  useParams,
  Link,
} from "react-router-dom";
import { GameContext } from './GameContext';

function Player() {

  console.log("****** new render ******")

  const { gameidurl, playerid } = useParams(); 
  const [game, setGame] = useContext(GameContext);
  
  useEffect (() => {
    // console.log("PLAYER: game obj entries length: ", Object.entries(game).length );
    if (!game.gameId || game.gameId != gameidurl || Object.entries(game).length === 0){
        console.log("PLAYER: game not set, grabbing it! ", gameidurl );
        game.gameId = gameidurl;
        setGame(game);
        getGameAPI();
    }

  }, []);

  const getGameAPI = async () => {
    try {
        const data = await fetch(
            'http://localhost:9000/getGame/' + game.gameId
        );

        const gameFromAPI = await data.json(); 
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });

        console.log("getGame, gameFromAPI:", gameFromAPI)
    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  const setGameAPI = async () => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game)
      };

      console.log("POST!! coins: ", game.players[playerid-1].coins);

      const data = await fetch('http://localhost:9000/setGame', requestOptions);
      const gameFromAPI = await data.json();

      console.log("POST!! gameFromAPI coins: ", gameFromAPI.players[playerid-1].coins);
   
      // setGame({
      //   ...gameFromAPI,
      //   players : [...gameFromAPI.players],
      //   characters : [...gameFromAPI.characters]
      // });

    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  
  
  function income(e) {
    e.preventDefault();
    // if (game.players[playerid-1]) {
      const coins = game.players[playerid-1].coins + 1;
      game.players[playerid-1].coins = coins; // not sure if I should/can do this?
      
      game.players[playerid-1].turn = false;
      game.players[(game.numPlayers == playerid) ? 0 : playerid].turn = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid-1].coins );
      setGameAPI();
    // }
  }

  function aide(e) {
    e.preventDefault();
    // if (game.players[playerid-1]) {
      const coins = game.players[playerid-1].coins + 2;
      game.players[playerid-1].coins = coins; 

      game.players[playerid-1].turn = false;
      game.players[(game.numPlayers == playerid) ? 0 : playerid].turn = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid-1].coins );
      setGameAPI();
    // }
  }

  function coop(e) {
    e.preventDefault();
    // if (game.players[playerid-1]) {
      const coins = game.players[playerid-1].coins - 7;
      game.players[playerid-1].coins = coins; // not sure if I should/can do this?

      game.players[playerid-1].turn = false;
      game.players[(game.numPlayers == playerid) ? 0 : playerid].turn = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid-1].coins );
      setGameAPI();
    // }
  }

  const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
  }
  
  let coins = getNestedObject(game, ['players', playerid-1, 'coins']);
  let turn = getNestedObject(game, ['players', playerid-1, 'turn']) ? "Your turn!" : "";

  console.log("coins: ", coins);
  console.log("turn: ", turn);

  return (
    <div>
      
      <h1>Player Page {playerid} </h1>
      <h2>{turn}</h2>
      {coins}

      <button onClick={income}>Collect Income</button>
      <button onClick={aide}>Collect Foreign Aide</button>
      <button onClick={coop}>Coop!</button>

      
    </div>
  );
  
}

export default Player;

