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
  const [chooseCharId, setChooseCharId] = useState(0); 
  const [actOnId, setActOnId] = useState([]); 
  const [actOnChecked, setActOnChecked] = useState(0);
  // const [exchangePicks, setExchangePicks] = useState({'p0':false, 'p1': false, 'p2': false, 'p3': false}); 
  const [exchangePicks, setExchangePicks] = useState([false,false,false,false]); 

  const [numSelected, setNumSelected] = useState(0);
  const [pickedCard, setPickedCard] = useState(false);
  // const [stealingFrom, stealingFrom]
  // const [wait, setWait] = useState(false);
  // const [challenged, setChallenged] = false;
  // const [coopPlayer, setCoopPlayer] = useState(0);

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

  function updateGameAPI() {
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    })
    setGameAPI();
  }

  function updateGame() {
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    })
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

    game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;
    while(!game.players[game.pTurnId].active) {
      game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;
    }
    // game.waitingOnId = game.pTurnId;
    game.players[game.pTurnId].turn = true;
    
    game.challenge = false;
    // setChallenged(false);

    game.passed = 0;

    let first = false;
    game.players.forEach((p, i) => {
      if (p.active && !first){
        first = true;
      }
      p.passed = false
      p.characters[0].swap = "";
      p.characters[1].swap = "";
      p.challenge = false;
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
  function action(e) {
    console.log("*** ACTION CHOSEN")

    const action = e.target.name;
    game.actionTaken = action;
    // console.log(!challenge && (action == "steal" || action == "exchange" || action == "aid" || action == "tax"))
    // if (!challenge && (action == "steal" || action == "exchange" || action == "aid" || action == "tax")) {
    //   game.challenge = true;
    //   console.log("not calling takeAction")
    //   updateGame();
    // if (action != "steal"){
      takeAction(action);
    // }
  }
  
  const takeAction = async(action) => {
    // e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      let body = {};
      // const action = e.target.name;
      console.log("ACTION: ", action);

      if (action == "steal" || action == "coop" || action == "exchange" && actOnId) {
        body = {"gameId": gameidURL,  "playerId": playerid, "action": action, "actOnId": actOnId};
      } else {
        body = {"gameId": gameidURL,  "playerId": playerid, "action": action, "actOnId": []};
      }

      console.log("POST takeTurn ", body);
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('http://localhost:9000/takeTurn', requestOptions);
        const gameFromAPI = await data.json();
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });

        console.log("game from API:");
        console.log(gameFromAPI);

        console.log(game);
      } catch(e) {
          console.log(e);
          return <div>Error: {e.message}</div>;
      }
    }
  }

  const _challenge = async(action) => {
    
    if (can_challenge) {
      let body = {"gameId": gameidURL, "playerId": playerid, "action": action, "game": game}

      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('http://localhost:9000/challenge', requestOptions);
        const gameFromAPI = await data.json();

        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });
      } catch(e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
      }
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
      updateGameAPI();
    }

  }

  // When challenging a block counteraction, playerid = game.pturnid
  function challenge(e) {
    e.preventDefault();

    // setChallenged (true);
    console.log("***CHALLENGE***");

    let turnPlayer = game.players[game.pTurnId];
    let c_0 =  turnPlayer.characters[0]; 
    let c_1 =  turnPlayer.characters[1];
    let success = false;
    game.players[playerid].challenge = true;
    
    console.log("can_challenge: ", can_challenge);
    if (can_challenge) {
      console.log("turnPlayer.actionTaken: ", turnPlayer.actionTaken);
      // if (turnPlayer.actionTaken == 'exchange') {
      //   let swappedOutChar = turnPlayer.characters[0].swap? turnPlayer.characters[0].swap : turnPlayer.characters[1].swap;
      //   let cardIndex = turnPlayer.characters[0].swap? 0: 1;
      //   if (game.characters[swappedOutChar].action != turnPlayer.actionTaken) {
      //     game.characters[cardIndex].active = false;
      //     game.players[playerid].losePlayer = true;
      //     if ( !(game.characters[0].active && game.characters[1].active) ) {
      //       turnPlayer.active = false;
      //       game.activePlayers -= 1;
      //     }
      //     success = true;
      //     console.log("Challenge of exchange success: ", success);
      //   }
      // }
      
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
        turnPlayer.influence -= 1;
        game.activePlayers -= 1;
        success = true;
        // nextTurn();
      } else if (c_1.active && game.characters[c_1.id].action != turnPlayer.actionTaken && !c_0.active) {
        console.log("Challenge: SUCCESS Lose Player!, only 1 is active");
        c_1.active = false;
        turnPlayer.active = false;
        turnPlayer.influence -= 1;
        game.activePlayers -= 1;
        success = true;
        nextTurn();
      } else {
        // shouldn't get here
        // console.log("Challenger: lose player!!");
        game.players[playerid].losePlayer = true;
      }
    }

    // if (success) {
    //   if (turnPlayer.actionTaken == 'tax') {
    //     console.log("Removing TAX");
    //     turnPlayer.coins = turnPlayer.coins - 3;
    //     // nextTurn();
    //   } else if (turnPlayer.actionTaken == 'steal') {
    //     console.log("Remove STEAL");

    //     turnPlayer.coins = turnPlayer.coins - 2;
        
    //     const steal_from_coins = game.players[playerid].coins;
    //     game.players[playerid].coins = steal_from_coins + 2;

    //     console.log("GAME BELOW ->")
    //     console.log(game);
    //   } else if (turnPlayer.actionTaken == 'exchange') {
    //     let swappedOutChar = turnPlayer.characters[0].swap? turnPlayer.characters[0].swap : turnPlayer.characters[1].swap;
    //     let cardIndex = turnPlayer.characters[0].swap? 0 : 1;
    //     let swappedInChar = turnPlayer.characters[cardIndex].id;

    //     game.characters[swappedOutChar].available -= 1;
    //     turnPlayer.characters[cardIndex].id = swappedOutChar;
    //     turnPlayer.characters[cardIndex].swap = "";
    //     game.characters[swappedInChar].available += 1;
    //     console.log("UN_SWAPPED!!");
    //   }
    // }

    // if (!turnPlayer.losePlayer && !game.players[playerid].losePlayer) {
    //   nextTurn();
    // }

    updateGameAPI();

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
        blockingPlayer.influence -= 1;
        success = true;
        // nextTurn();
      } else if (c_1.active && game.characters[c_1.id].block != turnPlayer.actionTaken && !c_0.active) {
        console.log("Challenge Block: SUCCESS Lose Player!, only 1 is active");
        c_1.active = false;
        blockingPlayer.active = false;
        blockingPlayer.influence -= 1;
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
    updateGameAPI();
      
      // console.log("Challenge: after setGame: ")
    // console.log(game);
    //console.log("game.players[playerid].challenge: ", game.players[playerid].challenge)

  }

  // function pass(e) {
  //   e.preventDefault();
  //   game.passed = game.passed + 1;
  //   game.players[playerid].passed = true;
    
  //   // TODO: need to active players count
  //   if (game.passed == game.activePlayers - 1){  
  //     nextTurn();
  //   }

  //   updateGameAPI();

  // }

  const pass = async(e) => {

    
    if (can_challenge || can_block) {
      let body = {"gameId": gameidURL, "playerId": playerid}

      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('http://localhost:9000/pass', requestOptions);
        const gameFromAPI = await data.json();

        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });
      } catch(e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
      }
    }
  }

  function getNestedObject(nestedObj, pathArr) {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);    
  }

  function handleChooseCharChange(e) {
    e.preventDefault();
    setChooseCharId(e.target.value);
    console.log("handleChooseCharChange, e.target.value ", e.target.value, "choosecharid: ", chooseCharId);

  }

  function handleLoseCharSubmit(e) {
    e.preventDefault();
    setChooseCharId(e.target.value);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^ ", chooseCharId);
    game.players[playerid].characters[parseInt(chooseCharId)].active = false;
    game.players[playerid].losePlayer = false;
    game.players[playerid].influence -= 1;
    nextTurn();
    updateGameAPI();
  }

  function handleSwapCard(e) {
    console.log("handleSwapCard")
    e.preventDefault();
    setChooseCharId(e.target.value);
    console.log("chooseCharId: ", chooseCharId);
    setPickedCard(true);
    game.players[playerid].characters[chooseCharId].swap = game.players[playerid].characters[chooseCharId].id;
    updateGame();
    // takeAction(e.target.name);
    setChooseCharId(null);
    console.log("handleSwapCard, chooseCharId.id: ", game.players[playerid].characters[chooseCharId].id);
  } 

  console.log(actOnId)
  function handleActOnChange(e) {
    // actOnId = e.target.value;
    setActOnChecked(e.target.value);
    console.log("in handleActOnChange actOnId[0]", actOnChecked);
    console.log("actOnId[0] == e.target.value ", actOnChecked == e.target.value);

  }

  function handleActOnSubmit(e) {
    // actOnId[0] = e.target.value;
    // setActOnId(actOnId);
    e.preventDefault();
    actOnId[0] = actOnChecked;
    setActOnId(actOnId);
    
    console.log("in handleActOnSubmit, actOnId: ", actOnId);
    takeAction(e.target.name);
    // setActOnId(null);
  }


  function handleExchangePicksChange(e){
    // console.log(exchangePicks);

    console.log("game.players[playerid].influence: ", game.players[playerid].influence)
    const value = !exchangePicks[e.target.name];
    console.log("****HANDLE CHANGE numSelected: ", numSelected);
    if (numSelected < game.players[playerid].influence && value) {
      console.log("CHECK!");
      exchangePicks[e.target.name] = !exchangePicks[e.target.name];
      setExchangePicks(exchangePicks);
      setNumSelected(numSelected + 1);

    }
    if (!value) {
      console.log("UNCHECK!");
      exchangePicks[e.target.name] = !exchangePicks[e.target.name];
      setExchangePicks(exchangePicks);
      setNumSelected(numSelected - 1);
    } 
    console.log(exchangePicks);
  }

  function handleExchangePicksSubmit(e){
    e.preventDefault();
    if (numSelected != game.players[playerid].influence) {
      let msg = "Must select " + game.players[playerid].influence + " cards."
      alert(msg);
      return false;
    }

    exchangePicks.forEach((p,i)=>{
      if (p){
        setActOnId(actOnId.push(game.players[playerid].characters[i].id));
      }
    });

    console.log("IN Submit, actOnId:", actOnId);
    takeAction('exchange');

  }
  
  let coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const alive = useGetNestedObject(game, ['players', playerid, 'active']);
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  // const waitingOnMe = useGetNestedObject(game, ['waitingOnId']) == playerid ? true : false;
  const losePlayer = useGetNestedObject(game, ['players', playerid, 'losePlayer']);
  const stealing = turn && game.actionTaken == 'steal' ? true : false;
  const cooping = turn && game.actionTaken == 'coop' ? true : false
  const exchanging = turn && game.actionTaken == 'exchange' ? true : false;

  const passed = useGetNestedObject(game, ['players', playerid, 'passed']);
  const challenged = useGetNestedObject(game, ['players', playerid, 'challenge']);
  const can_coop = coins > 6? true: false;
  console.log("can_coop? ", can_coop);
  const blocked = useGetNestedObject(game, ['players', playerid, 'blockedBy']) === "" ? false : true;

  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']);
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']); 
  const character_0_active = useGetNestedObject(game, ['players', playerid, 'characters', 0, "active"]);
  const character_1_active = useGetNestedObject(game, ['players', playerid, 'characters', 1, "active"]);
  const actionChosen = useGetNestedObject(game, ['players', playerid, 'actionTaken']) ? true: false;
  let active_players = new Array(game.numPlayers);
  
    for (let i = 0; i < game.numPlayers; i++ ) {
      active_players[i] = getNestedObject(game, ['players'], 'active')? getNestedObject(game, ['characters', character_0, 'name']) : false;
    }

  let steal_players_form = "";
  if (game.players) {
    console.log("RE-RENDER FORM")
    steal_players_form = game.players.map( (p, i) => {
      if (i != playerid && p.coins > 0 && p.active) {  // Add active property to player.  Make first active player checked.
        return ( 
          <div>
          <input
            type="radio"
            value={p.id}
            checked={actOnChecked == p.id}
            key = {p.id}
            onChange={handleActOnChange}
          /> {p.id + 1}
          </div> )
      }
    });
  }

  let coop_form = "";
  if (game.players) {
    coop_form = game.players.map( (p, i) => {
      if (i != playerid && p.active) {  // Add active property to player.  Make first active player checked.
        return ( 
          <div>
          <input
            type="radio"
            value={p.id}
            checked={actOnChecked == p.id}
            key = {p.id}
            onChange={handleActOnChange}
          /> {p.id + 1}
          </div> ) 
      }
    });
  }

  let exchange_form = "";
  if (game.players) {
    // console.log(exchangePicks);
    exchange_form = game.players[game.pTurnId].characters.map( (p, i) => {
      // console.log("**** ",p);
      if (p.active) {  // Add active property to player.  Make first active player checked.
        return ( 
          <div>
          <input
            type="checkbox"
            name={i}
            value={p.id}
            // checked={exchangePicks.i}
            checked={exchangePicks[i]}
            // disabled={numSelected >= game.players[playerid].influence}
            key = {i}
            onChange={handleExchangePicksChange}
          /> {game.characters[p.id].name}
          </div> );
        } else {
          i += 1;
        }
    });
  }

  let pick_card_form =
      <div>     
        <input
          type="checkbox"
          value="0"
          name={character_0_name}
          checked={chooseCharId == 0}
          onChange={handleChooseCharChange}
        /> {character_0_name}
        <input
          type="checkbox"
          value="1"
          name={character_1_name}
          checked={chooseCharId == 1}
          onChange={handleChooseCharChange}
        /> {character_1_name}
      </div>


  const can_challenge = challenge_actions.includes(game.actionTaken);
  const can_block = block_actions.includes(game.actionTaken);
  
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
    if (!turn || (turn && game.challenge)) {
      console.log(game)
      return await getGameAPI();
    }
  }, 5000);

console.log(game);
  // ******* RENDER ******* 

  if (!alive) {
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have are DEAD </h2>

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
     
      </div>
    );
  }
  else if (exchanging && !pickedCard && !game.challenge) {
    // form with exchangeOptions
    return(
      <div>
        <div>Pick {game.players[game.pTurnId].influence} cards to keep:</div>
        <form onSubmit={handleExchangePicksSubmit} name="exchange">
          {/* {pick_card_form} */}
          {exchange_form}
          <button className="btn btn-default" type="submit">Submit</button>
        </form>
      </div>
    );
  // } else if (exchanging && pickedCard && !game.challenge /*&& !wait*/) { 
  //   // form with exchangeOptions
  //   return(
  //     <div>
  //       <div>Pick One Card to Keep</div>
  //       <form onSubmit={handleActOnSubmit} name="exchange">
  //         {exchange_form}
  //         <button className="btn btn-default" type="submit">Submit</button>
  //       </form>
  //     </div>
  //   );
  // }
  // Loosing one of two players. Form to choose which to lose.
  } else if (losePlayer && character_0_active && character_1_active){ 
    return (
    <div>
    <div>HEY YOU LOSE A PLAYER!</div>
    <form onSubmit={handleLoseCharSubmit}>
      <input
        type="radio"
        value="0"
        name={character_0_name}
        checked={chooseCharId == 0}
        onChange={handleChooseCharChange}
      /> {character_0_name}
      <input
        type="radio"
        value="1"
        name={character_1_name}
        checked={chooseCharId == 1}
        onChange={handleChooseCharChange}
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
      <form onSubmit={handleActOnSubmit} name="steal">
        {steal_players_form}
      <button className="btn btn-default" type="submit" >Submit</button>
      </form>
      </div>
    )
  }
  // challenge check does not work here since you cannot challenge a coop.
  else if (cooping && game.players[0].characters[0] && !game.challenge) { 
    return (
      <div>
      <div>Pick a Player to Coop: </div>
      <form onSubmit={handleActOnSubmit} name="coop">
        {coop_form}
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
      
      
      <button onClick={action} name="income" disabled={actionChosen}>Collect Income</button>
      <button onClick={action} name="aid" disabled={actionChosen}>Collect Foreign Aid</button>
      <button onClick={action} name="tax" disabled={actionChosen}>Collect Tax</button>
      <button onClick={action} name="exchange" disabled={actionChosen}>Exchange</button>
      {/* LEFT OFF HERE, should on click event be steal or action? */}
      <button onClick={action} name="steal" disabled={actionChosen}>Steal</button>
      <button onClick={action} name="coop" disabled={!can_coop || actionChosen}>Coop!</button>

      <h2>Characters</h2>
      <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
    </div>
    )
  // Chance to block aide, challenge action, or block.
  } else if (game.challenge && !turn ) { 
    return (
      <div>
        
        <h1>Player Page {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <span>Challenge/Counteraction/Pass</span> <br></br>
        <button onClick={challenge} disabled={(!can_challenge || challenged || passed) }>Challenge</button>
        <button onClick={block} disabled={(!can_block || challenged || passed)}>Block</button>
        {/* <button onClick={challenge}>Counteract</button> */}
        <button onClick={pass} disabled={(passed || challenged)}>Pass</button>

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
