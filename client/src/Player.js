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
import { useInterval, useGetNestedObject, useGetNestedObjectLength } from './Hooks'

function Player() {

  console.log("****** new render ******")

  const { gameidURL, playeridURL } = useParams(); 
  const playerid = playeridURL - 1;
  const [game, setGame] = useContext(GameContext);
  const challenge_actions = ['tax','assassinate','steal','exchange','block'];
  const block_actions = ['aid','steal','assassinate'];
  const [chooseCharId, setChooseCharId] = useState(0); 
  const [actOnId, setActOnId] = useState([]); 
  const [actOnChecked, setActOnChecked] = useState(-1);

  const [exchangePicks, setExchangePicks] = useState([false,false,false,false]); 

  const [numSelected, setNumSelected] = useState(0);
  const [playerNameForm, setPlayerNameForm] = useState("");
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(true);

  useEffect (() => {
    getGameAPI();
  }, []);

  console.log(game);

  const getGameAPI = async () => {
    console.log("----- IN GETGAMEAPI -----")
    try {
        const data = await fetch(
            '/api/getGame/' + gameidURL
        );

        const gameFromAPI = await data.json(); 

        console.log("GETGAMEAPI, got game: ", gameFromAPI);
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

  console.log("polling: ", polling);
  const resetGame = async () => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"gameId": gameidURL})
      };

      console.log("RESET! Setting game to {}");
      setPolling(false);
      setGame({});

      const data = await fetch('/api/resetGame', requestOptions);
      const gameFromAPI = await data.json();

      if (data.status && data.status == 418) {
        setError(gameFromAPI.error);
        game.actionTaken = "";
        // console.log("gameFromAPI", gameFromAPI);
        console.log(":( error", gameFromAPI.error);
        return;
      }
      
        console.log(" RESET GAME, Game is now: ", gameFromAPI);
        setError("");
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });
        setPolling(true);

      


    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  // function handleResetGame() {
  //   resetGame();
  // }

  function updateGame() {
    setGame({
      ...game,
      players : [...game.players],
      characters : [...game.characters]
    })
  }

  function action(e) {
    const action = e.target.name;
    // game.actionTaken = action;

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
        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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

        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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

        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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

        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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

        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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
        if (data.status == 418) {
          setError(gameFromAPI.error);
          game.actionTaken = "";
          console.log("gameFromAPI", gameFromAPI);
          console.log("error", gameFromAPI.error);
        }
        else {
          setError("");
          setGame({
            ...gameFromAPI,
            players : [...gameFromAPI.players],
            characters : [...gameFromAPI.characters]
          });
        }
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

      if (data.status == 418) {
        setError(gameFromAPI.error);
        game.actionTaken = "";
        console.log("gameFromAPI", gameFromAPI);
        console.log("error", gameFromAPI.error);
      }
      else {
        setError("");
        setGame({
          ...gameFromAPI,
          players : [...gameFromAPI.players],
          characters : [...gameFromAPI.characters]
        });
      }
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
    if (actOnChecked >= 0) {
      takeAction(e.target.name);
      setActOnId([]);
    }
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

  function getLosePlayerName() {
    let name = ""
    if (game.players && game.players[0]){
      game.players.forEach( (p) => {
        if (p.losePlayer) {
          name = p.playerName;
        }
      });
    }
    return name;
  }

  function getChallengerPlayerName() {
    let name = ""
    if (game.players && game.players[0]){
      game.players.forEach( (p) => {
        if (p.challenge) {
          name = p.playerName;
        }
      });
    }
    return name;
  }
  
  let coins = useGetNestedObject(game, ['players', playerid, 'coins']);
  const alive = useGetNestedObject(game, ['players', playerid, 'active']);
  const winner = game.winner === playerid ? true: false;
  const turn = useGetNestedObject(game, ['players', playerid, 'turn']) ? "Your turn!" : "";
  // const waitingOnMe = useGetNestedObject(game, ['waitingOnId']) == playerid ? true : false;
  const losePlayer = useGetNestedObject(game, ['players', playerid, 'losePlayer']);
  const stealing = turn && game.actionTaken == 'steal' ? true : false;
  const cooping = turn && game.actionTaken == 'coop' ? true : false
  const exchanging = turn && game.actionTaken == 'exchange' ? true : false;
  const exchange_done = useGetNestedObjectLength(game, ['players', playerid, 'characters'])  == 2 ? true : false;
  const assassinating = turn && game.actionTaken == 'assassinate' ? true : false;

  const passed = useGetNestedObject(game, ['players', playerid, 'passed']);
  const challenged = useGetNestedObject(game, ['players', playerid, 'challenge']);
  const can_coop = coins > 6? true: false;
  // console.log("can_coop? ", can_coop);
  const blocked = game.blockedBy !== "" && turn ? true : false;

  const blocker_name = useGetNestedObject(game, ['players', game.blockedBy, 'playerName']);
  const blocker = game.blockedBy === playerid? true : false;
  const challenger_name = getChallengerPlayerName();
  // console.log("blocker: ", blocker);
  // console.log("blockedBy: ", game.blockedBy);
  // console.log("playerid: ", playerid);

  const loser = getLosePlayerName();
  // console.log("loser ", loser);

  const playerName = useGetNestedObject(game, ['players', playerid, 'playerName']);
  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);
  // const character_0_image =  useGetNestedObject(game, ['characters', character_0, 'image']); 
  // const character_1_image =  useGetNestedObject(game, ['characters', character_1, 'image']);
  // // const image_c0 = character_0_image? require("'" + character_0_image + "'") : "";
  // console.log(character_0_image);
  // console.log(typeof character_0_image);
  const character_0_name = useGetNestedObject(game, ['characters', character_0, 'name']);
  const character_1_name = useGetNestedObject(game, ['characters', character_1, 'name']); 
  const character_0_active = useGetNestedObject(game, ['players', playerid, 'characters', 0, "active"]);
  const character_1_active = useGetNestedObject(game, ['players', playerid, 'characters', 1, "active"]);
  const actionChosen = useGetNestedObject(game, ['players', playerid, 'actionTaken']) ? true: false;

  const last_action = game.actionTaken ? game.actionTaken : "";
  const turn_player_name = useGetNestedObject(game, ['players', game.pTurnId, 'playerName']);
  // console.log("turn_player_name: ",turn_player_name);
  let active_players = new Array(game.numPlayers);

  let character_images = ""
  if (game && game.characters && game.characters[1].name !== 'undefined') {
    character_images = game.characters.map((c) => {
      switch(c.name) {
        case "Hen":
          return require('./hen2.jpg');
        case "Fox" :
          return require('./fox.jpg');
        case "Chick" :
          return require('./chic2.jpg');
        case "Rooster" :
          return require('./rooster2.jpg');
        case "Dog" :
          return require('./dog1.jpg');
      }
    });
    //require('./logo.jpeg')
  }

  let playersItems = "";
    if (game.players) {
        playersItems =  game.players.map((p) => {
            let playerid = p.id + 1;
            let character_0 = p.characters[0];
            let character_1 = p.characters[1];
            let character_0_name = "";
            let character_1_name = "";
            let character_0_img = "";
            let character_1_img = "";
            let dead = !p.active;
            let winner = game.winner === p.id ? true: false;
            let playerName = p.playerName ? p.playerName : "Player " + playerid;
            if (!character_0.active || game.winner) {
                console.log("character 0 dead.", game.characters[character_0.id].name)
                character_0_name = game.characters[character_0.id].name;
                character_0_img = character_images[character_0.id];
            }
            if (!character_1.active || game.winner) {
                console.log("character 1 dead.")
                character_1_name = game.characters[character_1.id].name;
                character_1_img = character_images[character_1.id];
            }

            let link = "/" + gameidURL + "/player/" + playerid;
            if (dead && game.players && game.players[0]) {
              return (
                <div className={p.turn ? "player-item highlight" : "player-item"}>
                <div key={p.id} className="player">
                  <div className="player-name">{playerName}</div> 
                    <span> DEAD </span>
                    <div className="player-eggs">Eggs: {p.coins}</div>
                    <div className="revealed-card">
                          <span>{character_0_name} </span>
                          <img src={character_0_img} ></img>
                        </div>
                        <div className="revealed-card">
                          <span>{character_1_name} </span>
                          <img src={character_1_img} ></img>
                        </div>
                </div>
                </div>
              );             
            }
            else if (winner) {
                return (
                    <div className={p.turn ? "player-item highlight" : "player-item"}>
                    <div key={p.id} className="player">
                      <div className="player-name">{playerName}</div> 
                        <span> WINNER!!! </span>
                        <div className="player-eggs">Eggs: {p.coins}</div>
                        <div className="revealed-card">
                          <span>{character_0_name} </span>
                          <img src={character_0_img} ></img>
                        </div>
                        <div className="revealed-card">
                          <span>{character_1_name} </span>
                          <img src={character_1_img} ></img>
                        </div>
                    </div>
                    </div>
                  );               
            }
            else {
                return (
                    <div className={p.turn ? "player-item highlight" : "player-item"}>
                    <div key={p.id} className="player">
                      <div className="player-name">{playerName}</div> 
                        <div className="player-eggs">Eggs: {p.coins}</div>
                        <div className="revealed-card">
                          <span>{character_0_name} </span>
                          <img src={character_0_img} ></img>
                        </div>
                        <div className="revealed-card">
                          <span>{character_1_name} </span>
                          <img src={character_1_img} ></img>
                        </div>
                    </div>
                    </div>
                );
            }
        });
    }

  let cards = ""
  if(game.players) {
  cards = 
  <div className="cards-container-outer">
    <div className="rules-header">Cards</div>
    <div className="cards-container">
      <div className={character_0_active? "player-cards": "player-cards dead"}>
        <div className="character-header">The {character_0_name}</div>
        {/* <div>{ (character_0_active) ? <span>Alive</span> : <span>Dead</span> }</div> */}
        <img src={character_images[character_0]}></img>
      </div>
      <div className={character_1_active? "player-cards": "player-cards dead"}>
        <div className="character-header">The {character_1_name}</div>
        <img src={character_images[character_1]}></img>
        {/* <div>{ (character_1_active) ? <span>Alive</span> : <span>Dead</span> }</div> */}
      </div>
    </div>
  </div>
  }

  let game_rules = "";
  if (game.players) {
    game_rules = 
    <div className="rules-container-outer">
    <div className="rules-header">Game Rules</div>
    <div className="rules-container">
      <div className="rules-col">
        <div className="rules-sub-title">Character</div>
        <div className="rules-item">---</div>
        <div className="rules-item">---</div>
        <div className="rules-item">---</div>
        <div className="rules-item">Hen</div>        
        <div className="rules-item">Fox</div>
        <div className="rules-item">Chick</div>
        <div className="rules-item">Rooster</div>
        <div className="rules-item">Dog</div>
      </div>
      <div className="rules-col">
        <div className="rules-sub-title">Action</div>
        <div className="rules-item">Income</div>
        <div className="rules-item">Aid</div>
        <div className="rules-item">Coop</div>
        <div className="rules-item">Tax</div>
        <div className="rules-item">Assassinate</div>
        <div className="rules-item">Exchange</div>
        <div className="rules-item">Steal</div>
        <div className="rules-item">X</div>
      </div>
      <div className="rules-col">
        <div className="rules-sub-title">Effect</div>
        <div className="rules-item">Take 1 coin</div>
        <div className="rules-item">Take 2 coins</div>
        <div className="rules-item">Pay 7 coins 
          <div className="rules-note">choose player to lose card</div>
        </div>
        <div className="rules-item">Take 3 coins</div>
        <div className="rules-item">Pay 3 coins
          <div className="rules-note">choose player to lose card</div>
        </div>
        <div className="rules-item">Exchange cards</div>
        <div className="rules-item">Steal 2 coins
        <div className="rules-note">choose player to steal from</div>
        </div>
        <div className="rules-item">X</div>
      </div>
      <div className="rules-col">
        <div className="rules-sub-title">Counteraction</div>
        <div className="rules-item">X</div>
        <div className="rules-item">X</div>
        <div className="rules-item">X</div>
        <div className="rules-item">Blocks aid</div>
        <div className="rules-item">X</div>
        <div className="rules-item">Blocks stealing</div>
        <div className="rules-item">Blocks stealing</div>
        <div className="rules-item">Blocks assassination</div>
      </div>
    </div>
    </div>
  }

  
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


// polling
  useInterval(async () => {
    if (polling) {
      return await getGameAPI();
    }
  }, 5000);


  // console.log(!game.actionTaken);
  // console.log(!game.challenge);
  // console.log(turn)

  // ******* RENDER ******* 
  if (!playerName && game.players) {
    if ( game.players[playerid]) {
      return (
        <div className="name-form">
        <form onSubmit={handlePlayerNameSubmit} >
          <div className="player-name-form">Player Name:</div>
          <br></br>
          <input 
            type="text" 
            value={playerNameForm}
            onChange={(event) => {setPlayerNameForm(event.target.value)}}
          />
          <button className="btn btn-default" type="submit">Submit</button>
        </form>
        </div>
      );
    } else {
      return (
      <div className="no-user-found">
        Enter game {gameidURL} from the <Link className="green-txt" to='/'>HOME</Link> page to join the game.
      </div>
      );
    }
  }
  if (!alive && game.players) {
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
          <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3>You are DEAD :( </h3>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
        
      </div>
    );
  }
  else if (winner) {
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
            <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
            <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
            {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3 className="game-content-eggs">You have {coins} eggs </h3>
          <h3>You are the WINNER! </h3>  
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  }
  else if (exchanging && !actOnId.length && !game.challenge && !losePlayer && !exchange_done) {
    // form with exchangeOptions
    console.log(game.challenge);
    return(
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">It's your turn.</h3>
          {/* <h3 className="game-summary-current-action">Pick {game.players[game.pTurnId].influence} cards to keep</h3> */}
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3 className="game-content-eggs">You have {coins} eggs </h3>
          <br></br>
          <h3 className="game-content-eggs">Pick {game.players[game.pTurnId].influence} cards to keep:</h3>
          {/* <div>Pick {game.players[game.pTurnId].influence} cards to keep:</div> */}
          <form onSubmit={handleExchangePicksSubmit} name="exchange">
            {exchange_form}
            <button className="btn-default action-btn" type="submit">Submit</button>
          </form>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  // Loosing one of two players. Form to choose which to lose.
  } else if (losePlayer && character_0_active && character_1_active){ 
    return (
    <div className="game-container">
      <div className="game-summary-container">
        <div className="title">COOP</div> 
        <h3 className="game-summary-title">{turn? "It's your turn." : "It's " + turn_player_name + "\'s turn." }</h3>
        <h3 className="game-summary-current-action">{turn? "You chose to " + game.actionTaken : "They chose to: " + game.actionTaken}</h3>
        <h3 className="game-summary-current-action">{blocker? "You chose to block" : blocked ? "you were blocked" : game.blockedBy? blocker_name + " blocked" : ""}</h3>
        <h3 className="game-summary-current-action">{challenger_name? challenged? "You challenged" : challenger_name + " challenged" : "" }</h3>
        <h3 className="game-summary-current-action">{"You lost challenge :( pick which character card to lose."}</h3>
        {playersItems}
      </div>
      <div className="game-content">
        {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
        {/* <div>HEY YOU LOSE A PLAYER!</div> */}
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
          <button className="btn-default action-btn" type="submit">Submit</button>
        </form>
      </div>
      {cards}
      {game_rules}
    </div>
    );
  }
  // steal form.  Choose who to steal from.
  else if (stealing && game.players[0].characters[0] && !game.losePlayer && !game.challenge) { 
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
          <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          {/* <div>Pick a Player to Steal From: </div> */}
          <h3 className="game-summary-current-action">Pick a Player to Steal From:</h3>
          <form onSubmit={handleActOnSubmit} name="steal">
            {steal_players_form}
          <button className="btn-default action-btn" type="submit" >Submit</button>
          </form>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  } else if (assassinating && !game.actOnId.length && !game.losePlayer && !game.challenge) {
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
          <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h3 className="game-summary-current-action">Pick a Player to Assassinate:</h3>
          <form onSubmit={handleActOnSubmit} name="assassinate">
            {coop_assassinate_form}
          <button className="btn-default action-btn" type="submit" >Submit</button>
          </form>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  }
  // challenge check does not work here since you cannot challenge a coop.
  else if (cooping && game.players[0].characters[0] && !game.challenge && coins > 7 && !game.losePlayer) { 
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
          <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h3 className="game-summary-current-action">Pick a Player to Coop:</h3>
          <form onSubmit={handleActOnSubmit} name="coop">
            {coop_assassinate_form}
          <button className="btn-default action-btn" type="submit" >Submit</button>
          </form>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  }
  // start turn, choose action to take.
  else if (turn && !game.challenge && !game.actionTaken) { 
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <div className="error">{error}</div>
          <h3 className="game-summary-title">It is your turn.</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}

          <h2 className="game-content-player-name">{playerName}, You have {coins} eggs</h2>
          <h3 className="game-summary-current-action green-txt">Choose what action you want to take</h3>

          {/* <h3 className="game-content-eggs">You have {coins} eggs </h3> */}
          
          
          <button className="btn-default action-btn" onClick={action} name="income" disabled={actionChosen}>Collect Income</button>
          <button className="btn-default action-btn" onClick={action} name="aid" disabled={actionChosen}>Collect Foreign Aid</button>
          <button className="btn-default action-btn" onClick={action} name="tax" disabled={actionChosen}>Collect Tax</button>
          <button className="btn-default action-btn" onClick={action} name="exchange" disabled={actionChosen}>Exchange</button>
          {/* LEFT OFF HERE, should on click event be steal or action? */}
          <button className="btn-default action-btn" onClick={action} name="steal" disabled={actionChosen}>Steal</button>
          <button className="btn-default action-btn" onClick={action} name="assassinate" disabled={actionChosen || (coins < 3)}>Assassinate</button>
          <button className="btn-default action-btn" onClick={action} name="coop" disabled={!can_coop || actionChosen}>Coop!</button>
      
      <div className="cards-and-rules-container">
        {cards}
        {game_rules}
      </div>
      </div>
      <button className="btn-start-over" onClick={resetGame}>Start Over</button>
    </div>
    );
  // Chance to block aide, challenge action, or block.
  } else if (game.challenge && !turn ) { 
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <div className="error">{error}</div>

          <h3 className="game-summary-title">It is {turn_player_name}'s turn.</h3>
          <h3 className="game-summary-current-action">{game.actionTaken? "They chose to: " + game.actionTaken: "They have not chosen what to do..."}</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3 className="game-content-eggs">You have {coins} eggs </h3>
          <h3 className="game-summary-current-action green-txt">Choose to challenge, block, or pass!</h3>
          <button className="btn-default action-btn" onClick={challenge} disabled={(!can_challenge || challenged || passed) }>Challenge</button>
          <button className="btn-default action-btn" onClick={block} disabled={(!can_block || challenged || passed)}>Block</button>
          {/* <button onClick={challenge}>Counteract</button> */}
          <button className="btn-default action-btn" onClick={pass} disabled={(passed || challenged)}>Pass</button>
        </div>
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
      </div>
    );
  // Chance to challenge counteraction (block).
  } else if (game.challenge && turn && blocked) { 
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
          <h3 className="game-summary-title">{turn? "It's your turn." : "It's " + turn_player_name + "\'s turn." }</h3>
          <h3 className="game-summary-current-action">{ blocker_name + " blocked you! Choose to challenge or pass" }</h3>
          {playersItems}
        </div>
        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
        
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3 className="game-content-eggs">You have {coins} eggs </h3>
          <h3 className="game-summary-current-action green-txt">Challenge or Pass the Block!</h3>
          { (!challenged && !passed) ? <button className="btn-default action-btn" onClick={challengeBlock}>Challenge</button> : null }
          { !(passed) ? <button className="btn-default action-btn" onClick={pass}>Pass</button> : null }
        
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>
        </div>
      </div>
    );
  } else {
    if (!game.players || !game.players[playerid]) {
      return(
        <div className="no-user-found"> <h1>WAITING...</h1></div>
      );
    }
    return (
      <div className="game-container">
        <div className="game-summary-container">
          <div className="title">COOP</div> 
        <div className="error">{error}</div>
          <h3 className="game-summary-title">{turn? "It's your turn." : "It's " + turn_player_name + "\'s turn." }</h3>
          <h3 className="game-summary-current-action">{turn? "You chose to: " + game.actionTaken : "They chose to: " + game.actionTaken}</h3>
          <h3 className="game-summary-current-action">{blocker? "You chose to block" : blocked ? "You were blocked" : game.blockedBy? blocker_name + " blocked" : ""}</h3>
          <h3 className="game-summary-current-action">{challenger_name? challenged? "You challenged" : challenger_name + " challenged" : "" }</h3>
          <h3 className="game-summary-current-action">{game.losePlayer? "Waiting on " + loser + " to choose which card to lose." : turn? "Waiting to see if someone challenges or blocks." : "Waiting on " + turn_player_name  }</h3>
          {playersItems}
        </div>

        <div className="game-content">
          {/* <Link to={"/".concat(gameidURL)}>{gameidURL}</Link> */}
          <h2 className="game-content-player-name">{playerName}</h2>        
          <h3 className="game-content-eggs">You have {coins} eggs </h3>
        
        <div className="cards-and-rules-container">
          {cards}
          {game_rules}
        </div>

        </div>
        <button className="btn-start-over" onClick={resetGame}>Start Over</button>
      </div>
    );
  }
  
}



export default Player;
