import React, { 
  useState,
  useEffect,
  useContext,
} from 'react';
import './App.css';
// import Characters from './Characters'
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
  const [loseCharId, setLoseCharId] = useState(0); 

  console.log("game.challenge: ", game.challenge);
  console.log("game.passed", game.passed);

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

    game.passed = 0;
    game.players.forEach((p) => {
      p.passed = false
    })

  }

  function passedReset() {
    game.players.forEach( (p) => {
      p.passed = false; // rename to pass
    })
  }
      // // game.players[playerid].passed = true;

  
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
    }
  }

  function challenge(e) {
    e.preventDefault();

    console.log("***CHALLENGE***")
    // game.challenge = false;

    // // challenging player whose turn it is.
    // game.players[playerid].challenge = true;
    // // game.players[playerid].passed = true;


    let turnPlayer = game.players[game.pTurnId];

    let character_0 =  turnPlayer.characters[0]; 
    let character_1 =  turnPlayer.characters[1];
    
    if (can_challenge) {
      if (character_0.active && character_1.active) {
          console.log("*** Lose Player!");
          if (game.characters[character_0.id].action != turnPlayer.actionTaken 
            && game.characters[character_1.id].action != turnPlayer.actionTaken) {
            turnPlayer.losePlayer = true;
            if (turnPlayer.actionTaken == 'tax') {
              turnPlayer.coins = turnPlayer.coins - 3;
            }
          } else {
            nextTurn();
          }
      } else if (character_0.active && game.characters[character_0.id].action != turnPlayer.actionTaken) {
        character_0.active = false;
        nextTurn();
      } else if (character_1.active && game.characters[character_1.id].action != turnPlayer.actionTaken) {
        character_1.active = false;
        nextTurn();
      } else {
        game.players[playerid].losePlayer = true;
      }
    }

    // reset passed
    passedReset();
    
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    });

    console.log("Challenge-- after setGame: ")
    console.log(game);
    // console.log("game.players[playerid].challenge: ", game.players[playerid].challenge)

  }

  function pass(e) {
    e.preventDefault();
    game.passed = game.passed + 1;
    game.players[playerid].passed = true;
    
    if (game.passed == game.numPlayers - 1){
      nextTurn();
    }

    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    });

  }

  function getNestedObject(nestedObj, pathArr) {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);    
  }

  function handleLoseCharChange(e) {
    e.preventDefault();
    setLoseCharId(e.target.value);
  }

  function handleLoseCharSubmit(e) {
    e.preventDefault();
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^ ", loseCharId);
    game.players[playerid].characters[parseInt(loseCharId)].active = false;
    game.players[playerid].losePlayer = false;
    nextTurn();
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    });
  }
  
  
  const coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  const losePlayer = useGetNestedObject(game, ['players', playerid, 'losePlayer']);
  const passed = useGetNestedObject(game, ['players', playerid, 'passed']);
  const challenged = useGetNestedObject(game, ['players', playerid, 'challenge']);

  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']);
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']); 
  const character_0_active = useGetNestedObject(game, ['players', playerid, 'characters', 0, "active"]);
  const character_1_active = useGetNestedObject(game, ['players', playerid, 'characters', 1, "active"]);


  const can_challenge = challenge_actions.includes(useGetNestedObject(game, ['players', game.pTurnId, 'actionTaken']))
  const can_block = block_actions.includes(useGetNestedObject(game, ['players', game.pTurnId, 'actionTaken']))
  
  const someoneLosePlayer = false;
  let i = 0;
  while (someoneLosePlayer && i < game.numPlayers) {
    if (getNestedObject(game, ['players', i, 'losePlayer']) == true) {
      someoneLosePlayer = true;
      i = i + 1;
      break;
    }
  }

  console.log("can_challenge: ", can_challenge);
  console.log("PPPassed: ",passed);

  useInterval(async () => {
    console.log("Polling Game")
    return await getGameAPI();
  }, 5000);

  if (losePlayer && character_0_active && character_1_active){
    return (
    <div>
    <div>HEY YOU LOSE A PLAYER!</div>
    <form onSubmit={handleLoseCharSubmit}>
      <input
        type="radio"
        value="0"
        name={character_0_name}
        checked={loseCharId == 0}
        onChange={handleLoseCharChange}
      /> {character_0_name}
      <input
        type="radio"
        value="1"
        name={character_1_name}
        checked={loseCharId == 1}
        onChange={handleLoseCharChange}
      /> {character_1_name}
      <button className="btn btn-default" type="submit">Submit</button>
    </form>
    </div>
    // <Character ></Character>
    );}

  else if (turn && !game.challenge) {
    return (
      <div>
      
      <h1>Player Page {playeridURL} </h1>
      <h2>You have {coins} coins </h2>
      
      
      <button onClick={income}>Collect Income</button>
      <button onClick={aid}>Collect Foreign Aid</button>
      <button onClick={tax}>Collect Tax</button>
      <button onClick={coop}>Coop!</button>

      <h2>Characters</h2>
      <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
    </div>
    )
  } else if (game.challenge && !turn) {

    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        { (can_challenge && !challenged && !passed) ? <button onClick={challenge}>Challenge</button> : null }
        { (can_block && !challenged && !passed) ? <button onClick={challenge}>Block</button> : null }
        {/* <button onClick={challenge}>Counteract</button> */}
        { !(passed) ? <button onClick={pass}>Pass</button> : null }

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
      </div>
    );
  } else {
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
     
      </div>
    );
  }
  
}



export default Player;

