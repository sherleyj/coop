import React, { 
  useState,
  useEffect,
  useContext,
} from 'react';
import './App.css';
// import Characters from './Characters'
import { 
  useParams,
  Link,
} from "react-router-dom";
import { GameContext } from './GameContext';
import { useInterval, useGetNestedObject } from './Hooks'

function Player() {

  console.log("****** new render ******")

  const { gameidURL, playeridURL } = useParams(); 
  const playerid = playeridURL - 1;
  const [game, setGame] = useContext(GameContext);
  const challenge_actions = ['tax','assassinate','steal','exchange','block'];
  const block_actions = ['aid','steal','assassinate'];
  const [loseCharId, setLoseCharId] = useState(0); 
  const [stealFrom, setstealFrom] = useState(0); 


  // console.log("game.challenge: ", game.challenge);
  // console.log("game.passed", game.passed);

  // TODO: Can one Duke block another Duke's foreign aid?

  useEffect (() => {
    console.log("PLAYER: game not set, grabbing it! ", gameidURL ); 
    getGameAPI();
  }, []);

  // useEffect (() => {
  //   if (Object.entries(game).length !== 0){
  //     setGameAPI();
  //   }
  // }, [game]);



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

        // console.log("getGame, gameFromAPI:", gameFromAPI)
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

      console.log("POST! posting game: ", game);

      const data = await fetch('http://localhost:9000/setGame', requestOptions);
      const gameFromAPI = await data.json();

      console.log("POST!! gameFromAPI coins: ", gameFromAPI.players[playerid].coins);

    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  function updateGame() {
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    })
    setGameAPI();
  }

  // TODO: skip inactive players when setting next players turn.
  function nextTurn() {
    game.players[game.pTurnId].turn = false;
    game.players[game.pTurnId].actionTaken = "";
    game.players[playerid].actionTaken = "";

    let blockerId = game.players[game.pTurnId].blockedBy;
    if (blockerId){
      let blockingPlayer = game.players[blockerId];
      blockingPlayer.actionTaken = "";
    }

    game.players[game.pTurnId].blockedBy = "";

    game.players[(game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1].turn = true;
    game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;

    game.challenge = false;

    game.passed = 0;

    let first = false;
    game.players.forEach((p, i) => {
      if (p.active && !first){
        setstealFrom(i);
        first = true;
      }
      p.passed = false
    })

  }

  function passedSet(id) {
    game.players.forEach( (p, i) => {
      if (i != id) {
        p.passed = true; // rename to pass
      } else {
        p.passed = false;
      }
    })
    game.passed = game.numPlayers - 2;
  }
      // // game.players[playerid].passed = true;

  
  const action = async(e) => {
    // e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      let turn = {};
      const action = e.target.name;
      console.log("ACTION value: ", e.target.value);
      if (action == "steal" && stealFrom) {
        turn = {"gameId": gameidURL,  "playerId": playerid, "action": action, "game": game, "actOnPlayer": stealFrom};
      } else {
        turn = {"gameId": gameidURL,  "playerId": playerid, "action": action, "game": game, "actOnPlayer": null};
      }

      console.log("POST takeTurn ", turn);
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(turn)
        };

        const data = await fetch('http://localhost:9000/takeTurn', requestOptions);
        const gameFromAPI = await data.json();

        console.log("**** TOOK INCOME coins: ", gameFromAPI.players[playerid].coins);

      } catch(e) {
          console.log(e);
          return <div>Error: {e.message}</div>;
      }
    }
  }


  // TODO
  function coop(e) {
    e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      const coins = game.players[playerid].coins - 7;
      game.players[playerid].coins = coins; 
      game.players[playerid].actionTaken = "coop";
      nextTurn();
      updateGame();
    }
  }

  function block(e) {
    e.preventDefault();
    console.log("***BLOCK***");

    let turnPlayer = game.players[game.pTurnId];
    let blockingPlayer = game.players[playerid];

    game.players[playerid].actionTaken = 'block';
    turnPlayer.blockedBy = playerid;
    game.challenge = true

    if (can_block) {
      if (turnPlayer.actionTaken == 'aid') {
        turnPlayer.coins = turnPlayer.coins - 2;
      }
      if (turnPlayer.actionTaken == 'steal') {
        turnPlayer.coins = turnPlayer.coins - 2;
        blockingPlayer.coins = blockingPlayer.coins + 2;
        console.log("turnplayer coins: " + turnPlayer.coins + " blocking player coins: " + blockingPlayer.coins);
      }

      // nextTurn();
      passedSet(game.pTurnId);
      updateGame();
    }

  }

  // When challenging a block counteraction, playerid = game.pturnid
  function challenge(e) {
    e.preventDefault();

    console.log("***CHALLENGE***");

    let turnPlayer = game.players[game.pTurnId];
    let c_0 =  turnPlayer.characters[0]; 
    let c_1 =  turnPlayer.characters[1];
    let success = false;
    
    if (can_challenge) {
      if (c_0.active && c_1.active
      && game.characters[c_0.id].action != turnPlayer.actionTaken 
      && game.characters[c_1.id].action != turnPlayer.actionTaken) {
        console.log("Challenge: SUCCESS Lose Player!, both are active");
        turnPlayer.losePlayer = true;
        success = true;
        console.log("success: ", success);
        // if (turnPlayer.actionTaken == 'tax') {
        //   turnPlayer.coins = turnPlayer.coins - 3;
        // }
      } else if (c_0.active && game.characters[c_0.id].action != turnPlayer.actionTaken
        && !c_1.active) {
        console.log("Challenge: SUCCESS Lose Player!, only 0 is active");
        c_0.active = false;
        turnPlayer.active = false;
        game.activePlayers -= 1;
        success = true;
        // nextTurn();
      } else if (c_1.active && game.characters[c_1.id].action != turnPlayer.actionTaken && !c_0.active) {
        console.log("Challenge: SUCCESS Lose Player!, only 1 is active");
        c_1.active = false;
        turnPlayer.active = false;
        game.activePlayers -= 1;
        success = true;
        // nextTurn();
      } else {
        // shouldn't get here
        // console.log("Challenger: lose player!!");
        game.players[playerid].losePlayer = true;
      }
    }

    if (success) {
      if (turnPlayer.actionTaken == 'tax') {
        console.log("Removing TAX");
        turnPlayer.coins = turnPlayer.coins - 3;
        // nextTurn();
      } else if (turnPlayer.actionTaken == 'steal') {
        console.log("Remove STEAL");

        turnPlayer.coins = turnPlayer.coins - 2;

        console.log("stealFrom: ", stealFrom);
        
        const steal_from_coins = game.players[playerid].coins;
        game.players[playerid].coins = steal_from_coins + 2;

        console.log("GAME BELOW ->")
        console.log(game);
      }
    }

    updateGame();

  }

    // When challenging a block counteraction, playerid = game.pturnid
  function challenge_block(e) {
    e.preventDefault();

    console.log("***CHALLENGE BLOCK***");

    let blockingPlayer = game.players[game.players[game.pTurnId].blockedBy];

    let turnPlayer = game.players[game.pTurnId];
    let c_0 =  blockingPlayer.characters[0]; 
    let c_1 =  blockingPlayer.characters[1];
    let success = false;
    
    console.log("player 0: ", c_0.id);
    console.log("player 1: ", c_1.id);

    if (can_block) {
      if (c_0.active && c_1.active
      && game.characters[c_0.id].block != turnPlayer.actionTaken 
      && game.characters[c_1.id].block != turnPlayer.actionTaken) {
        console.log("Challenge Block: SUCCESS Lose Player!, both are active");
        blockingPlayer.losePlayer = true;
        success = true;
        // if (blockingPlayer.actionTaken == 'tax') {
        //   blockingPlayer.coins = blockingPlayer.coins - 3;
        // }
      } else if (c_0.active && game.characters[c_0.id].block != turnPlayer.actionTaken
        && !c_1.active) {
        console.log("Challenge Block: SUCCESS Lose Player!, only 0 is active");
        c_0.active = false;
        blockingPlayer.active = false;
        success = true;
        // nextTurn();
      } else if (c_1.active && game.characters[c_1.id].block != turnPlayer.actionTaken && !c_0.active) {
        console.log("Challenge Block: SUCCESS Lose Player!, only 1 is active");
        c_1.active = false;
        blockingPlayer.active = false;
        success = true;
        // nextTurn();
      } else {
        // challenge failed.
        // player that challenged the block (the player whose turn it currently is) loses a player!
        console.log("*** players id lose player!!!")
        game.players[playerid].losePlayer = true;
      }
    }

    if (success) {
      if (blockingPlayer.actionTaken == 'steal') {
        console.log("BLOCK FAILED. giving $ back");
        blockingPlayer.coins = blockingPlayer.coins - 2;        
        turnPlayer.coins = turnPlayer.coins + 2;

        console.log("GAME BELOW ->")
        console.log(game);
      }
    }

    // if (!blockingPlayer.losePlayer) {
    //   console.log("called nextTurn()");
    //   nextTurn();
    // }
      // reset passed
    // passedReset();      
    updateGame();
      
      // console.log("Challenge: after setGame: ")
    // console.log(game);
    //console.log("game.players[playerid].challenge: ", game.players[playerid].challenge)

  }

  function pass(e) {
    e.preventDefault();
    game.passed = game.passed + 1;
    game.players[playerid].passed = true;
    
    // TODO: need to active players count
    if (game.passed == game.activePlayers - 1){  
      nextTurn();
    }

    updateGame();

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
    updateGame();
  }


  function handleStealChange(e) {
    e.preventDefault();
    setstealFrom(e.target.value);
    console.log("in handleStealChange ", stealFrom);
  }

  function handleStealSubmit(e) {
    e.preventDefault();
    console.log("in handleStealSubmit: e.target.name: " + e.target.name);
    console.log("in handleStealSubmit: e.target.value: " + e.target.value);
    action(e);
    setstealFrom(null);

    // let stealFromCoins = getNestedObject(game, ['players', stealFrom, 'coins']);
    // let coins =  getNestedObject(game, ['players', playerid, 'coins']);
    // console.log("Stealing from player id: ",  stealFrom);

    // // challenge mode
    // game.challenge = true;

    // game.players[stealFrom].coins = stealFromCoins - 2;
    // game.players[playerid].coins = coins + 2;
    // game.players[playerid].passed = true;
    // game.players[stealFrom].passed = false;
    // // game.passed = game.passed - 1;

    // // nextTurn();
    // updateGame();
  }
  
  
  let coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  const losePlayer = useGetNestedObject(game, ['players', playerid, 'losePlayer']);
  const stealing = useGetNestedObject(game, ['players', playerid, 'actionTaken']) == 'steal' ? true : false;
  const passed = useGetNestedObject(game, ['players', playerid, 'passed']);
  const challenged = useGetNestedObject(game, ['players', playerid, 'challenge']);

  const blocked = useGetNestedObject(game, ['players', playerid, 'blockedBy']) === "" ? false : true;

  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']);
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']); 
  const character_0_active = useGetNestedObject(game, ['players', playerid, 'characters', 0, "active"]);
  const character_1_active = useGetNestedObject(game, ['players', playerid, 'characters', 1, "active"]);
  let active_players = new Array(game.numPlayers);
    for (let i = 0; i < game.numPlayers; i++ ) {
      active_players[i] = getNestedObject(game, ['players'], 'active')? getNestedObject(game, ['characters', character_0, 'name']) : false;
    }

  let steal_players_form = "";
  if (game.players) {
    steal_players_form = game.players.map( (p, i) => {
      if (i != playerid && p.coins > 1 && p.active) {  // Add active property to player.  Make first active player checked.
        return ( 
          <div>
          <input
            type="radio"
            value={p.id}
            name = "steal"
            checked={stealFrom == p.id}
            key = {p.id}
            onChange={handleStealChange}
          /> {p.id + 1}
          </div> ) 
      }
    });
  }


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

  // console.log("can_challenge: ", can_challenge);

  useInterval(async () => {
    console.log(game)
    return await getGameAPI();
  }, 5000);


  // ******* RENDER ******* 
  
  // Loosing one of two players. Form to choose which to loose.
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
    );
  }
  // steal form.  Choose who to steal from.
  else if (stealing && game.players[0].characters[0] && !game.challenge) { 
    return (
      <div>
      <div>Pick a Player to Steal From: </div>
      <form onSubmit={handleStealSubmit} name="steal">
        {steal_players_form}
      <button className="btn btn-default" type="submit" >Submit</button>
      </form>
      </div>
    )
  }
  // start turn, choose action to take.
  else if (turn && !game.challenge) { 
    return (
      <div>
      
      <h1>Player Page {playeridURL} </h1>
      <h2>You have {coins} coins </h2>
      
      
      <button onClick={action} name="income">Collect Income</button>
      <button onClick={action} name="aid">Collect Foreign Aid</button>
      <button onClick={action} name="tax">Collect Tax</button>
      {/* LEFT OFF HERE, should on click event be steal or action? */}
      <button onClick={action} name="steal">Steal</button>
      <button onClick={coop}>Coop!</button>

      <h2>Characters</h2>
      <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
    </div>
    )
  // Chance to block aide, challenge action, or block.
  } else if (game.challenge && !turn) { 
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <span>Challenge/Counteraction/Pass</span> <br></br>
        { (can_challenge && !challenged && !passed) ? <button onClick={challenge}>Challenge</button> : null }
        { (can_block && !challenged && !passed) ? <button onClick={block}>Block</button> : null }
        {/* <button onClick={challenge}>Counteract</button> */}
        { !(passed) ? <button onClick={pass}>Pass</button> : null }

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
      </div>
    );
  // Chance to challenge counteraction (block).
  } else if (game.challenge && turn && blocked) { 
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>
        <span>Challenge or Pass the Block</span> <br></br>

        { (!challenged && !passed) ? <button onClick={challenge_block}>Challenge</button> : null }
        { !(passed) ? <button onClick={pass}>Pass</button> : null }

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
      </div>
    );
  } else {
    return (
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



export default Player;
