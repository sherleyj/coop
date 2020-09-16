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
import { useInterval, useGetNestedObject } from './Hooks'


function Player() {

  console.log("****** new render ******")

  const { gameidURL, playeridURL } = useParams(); 
  const playerid = playeridURL - 1;
  const [game, setGame] = useContext(GameContext);
  // const pTurnId = game.pTurnId;

  console.log("challenge: ", game.challenge);


  console.log("playerid: ", playerid)

  useEffect (() => {
    if (!game.gameId || game.gameId != gameidURL || Object.entries(game).length === 0){
        console.log("PLAYER: game not set, grabbing it! ", gameidURL );
        game.gameId = gameidURL;
        setGame(game);
        getGameAPI();
    }

  }, []);

  const getGameAPI = async () => {
    try {
        const data = await fetch(
            'http://localhost:9000/getGame/' + gameidURL
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

      console.log("POST!! coins: ", game.players[playerid].coins);

      const data = await fetch('http://localhost:9000/setGame', requestOptions);
      const gameFromAPI = await data.json();

      console.log("POST!! gameFromAPI coins: ", gameFromAPI.players[playerid].coins);

    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  function nextTurn() {
    game.players[game.pTurnId].turn = false;
    game.players[(game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1].turn = true;
    game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;

  }
  
  function income(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins + 1;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "income";
      
      nextTurn();

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function aide(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins + 2;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "aide";

      //challenge mode
      game.challenge = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function tax(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins + 3;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "tax";

      // game.players[playerid].turn = false;
      // game.players[(game.numPlayers == playeridURL) ? 0 : playeridURL].turn = true;
      // game.pTurnId = (game.numPlayers == playeridURL) ? 0 : playeridURL;
      
      //challenge mode
      game.challenge = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function coop(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins - 7;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "coop";

      nextTurn();

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function steal(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins - 7;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "steal";

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function challenge(e) {
    e.preventDefault();

    console.log("***CHALLENGE***")
    game.challenge = false;

    nextTurn();


    // // challenging player whose turn it is.
    // game.players[playerid].challenge = true;
    // // game.players[playerid].cResponded = true;
    // let turnPlayer = game.players[game.pTurnId];
    // console.log("turnPlayer: ", turnPlayer)


    // game.challenge = false;
    // let character_0 =  turnPlayer.characters[0].id; 
    // let character_1 =  turnPlayer.characters[1].id;
    
    // if (game.characters[character_0].action != turnPlayer.actionTaken 
    //   || game.characters[character_1].action != turnPlayer.actionTaken) {
    //     turnPlayer.cLoosePlayer = true;
    //   }

    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    });
    setGameAPI();


    console.log("Challenge-- after setGame: ")
    console.log(game);
    // console.log("game.players[playerid].challenge: ", game.players[playerid].challenge)

  }
  
  const coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']) 
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']) 

  let turn_buttons = <div><button onClick={income}>Collect Income</button>
  <button onClick={aide}>Collect Foreign Aide</button>
  <button onClick={coop}>Coop!</button></div>;

  console.log("character players: ", character_0); 

  console.log("coins: ", coins);
  console.log("turn: ", turn);

  useInterval(async () => {
    console.log("Polling Game")
    return await getGameAPI();
  }, 7000);

  if (turn && !game.challenge) {
    return (
      <div>
      
      <h1>Player Page {playeridURL} </h1>
      <h2>You have {coins} coins </h2>
      
      
      <button onClick={income}>Collect Income</button>
      <button onClick={aide}>Collect Foreign Aide</button>
      <button onClick={tax}>Collect Tax</button>
      <button onClick={coop}>Coop!</button>

      <h2>Characters</h2>
      <div>{character_0_name}</div>
      <div>{character_1_name}</div>
    
    </div>
    )
  } else if (game.challenge && !turn) {

    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <button onClick={challenge}>Challenge</button>
        <button onClick={challenge}>Block</button>
        {/* <button onClick={challenge}>Counteract</button> */}

        <h2>Characters</h2>
        <div>{character_0_name}</div>
        <div>{character_1_name}</div>
      
      </div>
    );
  } else {
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <h2>Characters</h2>
        <div>{character_0_name}</div>
        <div>{character_1_name}</div>
      
      </div>
    );
  }
  
}



export default Player;

