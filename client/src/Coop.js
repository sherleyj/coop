import React, { 
    useState,
    useEffect,
    useContext,
} from 'react';
import './App.css';
import { 
    useParams,
    Link,
} from "react-router-dom";
import { GameContext } from './GameContext';
import { useInterval } from './Hooks'
import { get } from 'http';


function Coop() {

    const { gameidURL } = useParams(); 
    console.log("FROM COOP gameidURL: ", gameidURL)
    // const [gameId, setGameId] = useState(gameidURL);
    const [game, setGame]= useContext(GameContext);

    console.log("first to render in COOP, gameidURL: ", gameidURL);


    useEffect (() => {
        console.log("PLAYER: game not set, grabbing it! ", gameidURL ); 
        getGameAPI();
      }, []);
    
    //   useEffect (() => {
    //     if (Object.entries(game).length !== 0){
    //       setGameAPI();
    //     }
    //   }, [game]);

    const getGameAPI = async () => {
        try {
	    console.log("getting game");
            const data = await fetch(
                '/api/getGame/' + gameidURL
            );
    	    console.log("lalala");
            const gameFromAPI = await data.json();
	    console.log("game from api:", gameFromAPI);
            setGame({
              ...gameFromAPI,
              players : [...gameFromAPI.players],
              characters : [...gameFromAPI.characters]
            })
    
            console.log("GETGAME, gameFromAPI:", gameFromAPI)
        } catch (e) {
            console.log("Exception caught: ",e);
            return <div>Error: {e.message}</div>;
        }
    }; 


    let character_images = "";
    if (game && game.characters && game.characters[1].name !== 'undefined') {
      character_images = game.characters.map((c) => {
        switch(c.name) {
          case "Hen":
            return require('./hen2.png');
          case "Fox" :
            return require('./fox.png');
          case "Chick" :
            return require('./chic2.png');
          case "Rooster" :
            return require('./rooster2.png');
          case "Dog" :
            return require('./dog1.png');
        }
      });
    }

    let playersToRender = "";
    if (game.players) {
        playersToRender =  game.players.map((p) => {
            let playerid = p.id + 1;
            let character_0 = p.characters[0];
            let character_1 = p.characters[1];
            let character_0_name = "";
            let character_1_name = "";
            let character_0_img = "";
            let character_1_img = "";
            let dead = !p.active;
            let winner = game.winner == p.id ? true: false;
            let playerName = p.playerName ? p.playerName : "Player " + playerid;
            let message = "";
            if (dead) {
                message = "DEAD";
            }
            if (winner) {
                message = "WINNER!"
            }
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
            
              return (
                <div className={p.turn ? "b-player-item highlight" : "b-player-item"}>
                <div key={p.id} className="player">
                  {/* <div className="player-name">{playerName}</div>  */}
                  <div className="player-title">Player {p.id + 1}</div>
                  <div className="b-player-name"><Link to={link}>{playerName}</Link> </div>
                    <span> {message} </span>
                    <div className="b-player-eggs">Eggs: {p.coins}</div>
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
            


        });
    }

    // let playersToRender = "";
    // if (game.players) {
    //     playersToRender =  game.players.map((p) => {
    //         let turnText = "";
    //         let playerid = p.id + 1;
    //         let character_0 = p.characters[0];
    //         let character_1 = p.characters[1];
    //         let character_0_name = "";
    //         let character_1_name = "";
    //         let dead = !p.active;
    //         let winner = game.winner == p.id ? true: false;
    //         let playerName = p.playerName ? p.playerName : "Player " + playerid;
    //         if (!character_0.active) {
    //             console.log("character 0 dead.", game.characters[character_0.id].name)
    //             character_0_name = game.characters[character_0.id].name;
    //         }
    //         if (!character_1.active) {
    //             console.log("character 1 dead.")
    //             character_1_name = game.characters[character_1.id].name;
    //         }

    //         if (p.turn) {
    //             turnText = "Your turn!"
    //         }
    //         let link = "/" + gameidURL + "/player/" + playerid;
    //         if (dead) {
    //           return (
    //             <div>
    //             <div key={p.id} className="player"> <Link to={link}>{playerName}</Link> 
    //                 <span> DEAD </span>
    //                 <p>Num coins: {p.coins}</p>
    //                 <span>{character_0_name} </span>
    //                 <span>{character_1_name} </span>
    //                 <br />
    //                 --------------------------------
                    
    //             </div>
    //             </div>
    //           );             
    //         }
    //         else if (winner) {
    //             return (
    //                 <div>
    //                 <div key={p.id} className="player"> <Link to={link}>{playerName}</Link> 
    //                     <span> WINNER!!! </span>
    //                     <p>Num coins: {p.coins}</p>
    //                     <span>{character_0_name} </span>
    //                     <span>{character_1_name} </span>
    //                     <br />
    //                     --------------------------------
                        
    //                 </div>
    //                 </div>
    //               );               
    //         }
    //         else {
    //             return (
    //                 <div>
    //                 <div key={p.id} className="player"> <Link to={link}>{playerName}</Link> 
    //                     <span> {turnText}</span>
    //                     <p>Num coins: {p.coins}</p>
    //                     <span>{character_0_name} </span>
    //                     <span>{character_1_name} </span>
    //                     <br />
    //                     --------------------------------
                        
    //                 </div>
    //                 </div>
    //             );
    //         }
    //     });
    // }
   
    useInterval(async () => {
        // console.log("Polling Game")
        return await getGameAPI();
    }, 7000);
   
    return (
        <div className="board-container">
            <h1 className="board-title">{gameidURL}</h1>
            {/* <p>Pick a player!</p> */}
            {/* <p>Number of players: {game.numPlayers}</p> */}
            {/* <div>{game.players.map(p => (<span>{p} </span>))}</div> */}
            <div className="board">{playersToRender}</div>
            
        </div>
    );

}



export default Coop;

