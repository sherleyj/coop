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

  const [exchangePicks, setExchangePicks] = useState([false,false,false,false]); 

  const [numSelected, setNumSelected] = useState(0);
  const [playerNameForm, setPlayerNameForm] = useState("");

  useEffect (() => {
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
            '/api/getGame/' + gameidURL
        );

        const gameFromAPI = await data.json(); 
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });

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


      const data = await fetch('/api/setGame', requestOptions);
      const gameFromAPI = await data.json();


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

  function action(e) {
    const action = e.target.name;
    game.actionTaken = action;

    takeAction(action);
  }
  
  const takeAction = async(action) => {
    // e.preventDefault();
    if (game.players[playerid].turn && !game.challenge) {
      let body = {};
      // const action = e.target.name;

      if (action == "steal" || action == "coop" || action == "exchange" || action == "assassinate" && actOnId) {
        body = {"gameId": gameidURL,  "playerId": playerid, "action": action, "actOnId": actOnId};
      } else {
        body = {"gameId": gameidURL,  "playerId": playerid, "action": action, "actOnId": []};
      }
      console.log("** POST takeAction: ", body);

      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/takeTurn', requestOptions);
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

  const challenge = async(action) => {
    
    if (can_challenge) {
      let body = {"gameId": gameidURL, "playerId": playerid}
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/challenge', requestOptions);
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

  const challengeBlock = async(action) => {
    
      let body = {"gameId": gameidURL, "playerId": playerid}
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/challengeBlock', requestOptions);
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

  const block = async(action) => {
    if (can_block) {
      let body = {"gameId": gameidURL, "playerId": playerid}
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/block', requestOptions);
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

  const pass = async(e) => {
    if (can_challenge || can_block) {
      let body = {"gameId": gameidURL, "playerId": playerid}

      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/pass', requestOptions);
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

  const loseCharacterAPI = async(characterToLose) => {
    if (losePlayer) {
      let body = {"gameId": gameidURL, "playerId": playerid, "characterToLose": characterToLose};
      console.log("** POST loseCharacterAPI: ", body);
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        };

        const data = await fetch('/api/loseCharacter', requestOptions);
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

  const updatePlayerName = async(playerName) => {
    
    let body = {"gameId": gameidURL, "playerId": playerid, "playerName": playerName};
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      };

      const data = await fetch('/api/updatePlayerName', requestOptions);
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


  function getNestedObject(nestedObj, pathArr) {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);    
  }

  function handleChooseCharChange(e) {
    e.preventDefault();
    setChooseCharId(e.target.value);
  }

  function handleLoseCharSubmit(e) {
    e.preventDefault();
    setChooseCharId(e.target.value);

    loseCharacterAPI(chooseCharId);
  }

  function handleSwapCard(e) {
    e.preventDefault();
    setChooseCharId(e.target.value);
    game.players[playerid].characters[chooseCharId].swap = game.players[playerid].characters[chooseCharId].id;
    updateGame();
    // takeAction(e.target.name);
    setChooseCharId(null);
  } 

  function handleActOnChange(e) {
    // actOnId = e.target.value;
    setActOnChecked(e.target.value);

  }

  function handleActOnSubmit(e) {
    // actOnId[0] = e.target.value;
    // setActOnId(actOnId);
    e.preventDefault();
    actOnId[0] = actOnChecked;
    setActOnId(actOnId);
    
    takeAction(e.target.name);
    setActOnId([]);
  }


  function handleExchangePicksChange(e){
    // console.log(exchangePicks);

    const value = !exchangePicks[e.target.name];
    if (numSelected < game.players[playerid].influence && value) {
      exchangePicks[e.target.name] = !exchangePicks[e.target.name];
      setExchangePicks(exchangePicks);
      setNumSelected(numSelected + 1);

    }
    if (!value) {
      exchangePicks[e.target.name] = !exchangePicks[e.target.name];
      setExchangePicks(exchangePicks);
      setNumSelected(numSelected - 1);
    } 
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

    takeAction('exchange');
    setActOnId([]);
  }
  
  function handlePlayerNameSubmit(e) {
    e.preventDefault();
    updatePlayerName(playerNameForm);
  }

  function handlePlayerNameChange(e) {
    e.preventDefault();
    setPlayerNameForm(e.target.value);
  }
  
  let coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const alive = useGetNestedObject(game, ['players', playerid, 'active']);
  const winner = game.winner == playerid ? true: false;
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  // const waitingOnMe = useGetNestedObject(game, ['waitingOnId']) == playerid ? true : false;
  const losePlayer = useGetNestedObject(game, ['players', playerid, 'losePlayer']);
  const stealing = turn && game.actionTaken == 'steal' ? true : false;
  const cooping = turn && game.actionTaken == 'coop' ? true : false
  const exchanging = turn && game.actionTaken == 'exchange' ? true : false;
  const assassinating = turn && game.actionTaken == 'assassinate' ? true : false;

  const passed = useGetNestedObject(game, ['players', playerid, 'passed']);
  const challenged = useGetNestedObject(game, ['players', playerid, 'challenge']);
  const can_coop = coins > 6? true: false;
  // console.log("can_coop? ", can_coop);
  const blocked = game.blockedBy !== "" && turn ? true : false;

  const playerName = useGetNestedObject(game, ['players', playerid, 'playerName']);
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
  let coop_assassinate_form = "";
  if (game.players) {
    coop_assassinate_form = game.players.map( (p, i) => {
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
    exchange_form = game.players[game.pTurnId].characters.map( (p, i) => {
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
  // console.log(playerName);
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


  useInterval(async () => {
    if (!turn || (turn && game.challenge)) {
      return await getGameAPI();
    }
  }, 5000);

  // ******* RENDER ******* 
  if (!playerName) {
    return (
      <form onSubmit={handlePlayerNameSubmit}>
        <span>Player Name:</span>
        <br></br>
        <input 
          type="text" 
          value={playerNameForm}
          onChange={(event) => {setPlayerNameForm(event.target.value)}}
        />
        <br></br>
        <button className="btn btn-default" type="submit">Submit</button>
      </form>
    );
  }
  else if (!alive) {
    return (
      <div>
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
        <h1>{playerName} Player {playeridURL} </h1>        
        <h2>You have are DEAD </h2>

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
     
      </div>
    );
  }
  else if (winner) {
    return (
      <div>
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          
          <h1>{playerName} Player {playeridURL} </h1>        
          <h2>You have {coins} coins </h2>
          <h2>You are the WINNER! </h2>

          <h2>Characters</h2>
          <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
          <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
        </div>
    );
  }
  else if (exchanging && !actOnId.length && !game.challenge) {
    // form with exchangeOptions
    return(
      <div>
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}

        <div>Pick {game.players[game.pTurnId].influence} cards to keep:</div>
        <form onSubmit={handleExchangePicksSubmit} name="exchange">
          {exchange_form}
          <button className="btn btn-default" type="submit">Submit</button>
        </form>
      </div>
    );
  // Loosing one of two players. Form to choose which to lose.
  } else if (losePlayer && character_0_active && character_1_active){ 
    return (
    <div>
    {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
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
  else if (stealing && game.players[0].characters[0] && !game.losePlayer && !game.challenge) { 
    return (
      <div>
      {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
      <div>Pick a Player to Steal From: </div>
      <form onSubmit={handleActOnSubmit} name="steal">
        {steal_players_form}
      <button className="btn btn-default" type="submit" >Submit</button>
      </form>
      </div>
    )
  } else if (assassinating && !game.actOnId.length && game.losePlayer && !game.challenge) {
    return (
      <div>
      {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
      <div>Pick a Player to Assassinate: </div>
      <form onSubmit={handleActOnSubmit} name="assassinate">
        {coop_assassinate_form}
      <button className="btn btn-default" type="submit" >Submit</button>
      </form>
      </div>
    )
  }
  // challenge check does not work here since you cannot challenge a coop.
  else if (cooping && game.players[0].characters[0] && !game.challenge && coins > 7 && !game.losePlayer) { 
    return (
      <div>
      {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
      <div>Pick a Player to Coop: </div>
      <form onSubmit={handleActOnSubmit} name="coop">
        {coop_assassinate_form}
      <button className="btn btn-default" type="submit" >Submit</button>
      </form>
      </div>
    )
  }
  // start turn, choose action to take.
  else if (turn && !game.challenge && !game.actionTaken) { 
    return (
      <div>
      {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}

      <h1>{playerName} Player {playeridURL} </h1>
      <h2>You have {coins} coins </h2>
      
      
      <button onClick={action} name="income" disabled={actionChosen}>Collect Income</button>
      <button onClick={action} name="aid" disabled={actionChosen}>Collect Foreign Aid</button>
      <button onClick={action} name="tax" disabled={actionChosen}>Collect Tax</button>
      <button onClick={action} name="exchange" disabled={actionChosen}>Exchange</button>
      {/* LEFT OFF HERE, should on click event be steal or action? */}
      <button onClick={action} name="steal" disabled={actionChosen}>Steal</button>
      <button onClick={action} name="assassinate" disabled={actionChosen || (coins < 3)}>Assassinate</button>
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
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
        
        <h1>{playerName} Player {playeridURL} </h1>        
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
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
       
        <h1>{playerName} Player {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>
        <span>Challenge or Pass the Block</span> <br></br>

        { (!challenged && !passed) ? <button onClick={challengeBlock}>Challenge</button> : null }
        { !(passed) ? <button onClick={pass}>Pass</button> : null }

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
      
      </div>
    );
  } else {
    return (
      <div>
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
        
        <h1>{playerName} Player {playeridURL} </h1>        
        <h2>You have {coins} coins </h2>

        <h2>Characters</h2>
        <div>{character_0_name} { (character_0_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
        <div>{character_1_name} { (character_1_active) ? <span>- Active</span> : <span>- Dead</span> } </div>
     
      </div>
    );
  }
  
}



export default Player;
