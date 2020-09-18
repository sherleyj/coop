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
  const challenge_actions = ['tax','assassinate','steal','exchange'];
  const block_actions = ['aid','steal','assassinate'];

  console.log("game.challenge: ", game.challenge);
  console.log("game.cResponded", game.cResponded);

  useEffect (() => {
    if (!game.gameId || game.gameId != gameidURL || Object.entries(game).length === 0){
        console.log("PLAYER: game not set, grabbing it! ", gameidURL );
        game.gameId = gameidURL;
        setGame(game);
        getGameAPI();
    }

  }, []);

  useEffect (() => {
    setGameAPI();
  }, [game]);

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
    game.players[game.pTurnId].actionTaken = "";
    game.players[(game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1].turn = true;
    game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;

    game.challenge = false;

    game.cResponded = 0;
    game.players.forEach((p) => {
      p.cResponded = false
    })

  }

  function cRespondedReset() {
    game.players.forEach( (p) => {
      p.cResponded = false; // rename to pass
    })
  }
      // // game.players[playerid].cResponded = true;

  
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

      // console.log("income, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function aid(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins + 2;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "aid";

      //challenge mode for challenge or block
      game.challenge = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      // console.log("aid, now have: ", game.players[playerid].coins );
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

      // console.log("tax, now have: ", game.players[playerid].coins );
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

      // console.log("coop, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function steal(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins - 7;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "steal";

      //challenge mode
      game.challenge = true;

      setGame({
        ...game,
        players : [...game.players],
        characters : [...game.characters]
      })

      // console.log("steal, now have: ", game.players[playerid].coins );
      setGameAPI();
    }
  }

  function challenge(e) {
    e.preventDefault();

    console.log("***CHALLENGE***")
    // game.challenge = false;

    // // challenging player whose turn it is.
    // game.players[playerid].challenge = true;
    // // game.players[playerid].cResponded = true;


    let turnPlayer = game.players[game.pTurnId];

    let character_0 =  turnPlayer.characters[0]; 
    let character_1 =  turnPlayer.characters[1];
    
    if (can_challenge) {
      if ((game.characters[character_0.id].action != turnPlayer.actionTaken 
        && game.characters[character_1.id].action != turnPlayer.actionTaken)
        && character_0.active && character_1.active) {
          console.log("*** Loose Player!");
          turnPlayer.cLoosePlayer = true;
          if (turnPlayer.actionTaken == 'tax') {
            turnPlayer.coins = turnPlayer.coins - 3;
          }
      } else if (character_0.active && game.characters[character_0.id].action != turnPlayer.actionTaken) {
        character_0.active = false;
      } else if (character_1.active && game.characters[character_1.id].action != turnPlayer.actionTaken) {
        character_1.active = false;
      } else {
        game.players[playerid].cLoosePlayer = true;
      }
    }

    // reset cResponded
    cRespondedReset();

    nextTurn();
    
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

  function pass(e) {
    e.preventDefault();
    game.cResponded = game.cResponded + 1;
    game.players[playerid].cResponded = true;
    
    if (game.cResponded == game.numPlayers - 1){
      nextTurn();
    }

    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    });
    setGameAPI();

  }
  
  
  const coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']);
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']); 
  const can_challenge = challenge_actions.includes(useGetNestedObject(game, ['players', game.pTurnId, 'actionTaken']))
  const can_block = block_actions.includes(useGetNestedObject(game, ['players', game.pTurnId, 'actionTaken']))
  const passed = useGetNestedObject(game, ['players', playerid, 'cResponded']);
  console.log("can_challenge: ", can_challenge);
  console.log("PPPassed: ",passed);

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
      <button onClick={aid}>Collect Foreign Aid</button>
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

        { (can_challenge) ? <button onClick={challenge}>Challenge</button> : null }
        { (can_block) ? <button onClick={challenge}>Block</button> : null }
        {/* <button onClick={challenge}>Counteract</button> */}
        { !(passed) ? <button onClick={pass}>Pass</button> : null }

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

