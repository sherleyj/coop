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

    let playersToRender = "";
    if (game.players) {
        playersToRender =  game.players.map((p) => {
            let turnText = "";
            let playerid = p.id + 1;
            let character_0 = p.characters[0];
            let character_1 = p.characters[1];
            let character_0_name = "";
            let character_1_name = "";
            let dead = !p.active;
            if (!character_0.active) {
                console.log("character 0 dead.", game.characters[character_0.id].name)
                character_0_name = game.characters[character_0.id].name;
            }
            if (!character_1.active) {
                console.log("character 1 dead.")
                character_1_name = game.characters[character_1.id].name;
            }

            if (p.turn) {
                turnText = "Your turn!"
            }
            let link = "/" + gameidURL + "/player/" + playerid;
            if (dead) {
              return (
                <div>
                <div key={p.id} className="player"> <Link to={link}>Player {playerid}</Link> 
                    <span> DEAD </span>
                    <p>Num coins: {p.coins}</p>
                    <span>{character_0_name} </span>
                    <span>{character_1_name} </span>
                    <br />
                    --------------------------------
                    
                </div>
                </div>
              );             
            }
            else {
                return (
                    <div>
                    <div key={p.id} className="player"> <Link to={link}>Player {playerid}</Link> 
                        <span> {turnText}</span>
                        <p>Num coins: {p.coins}</p>
                        <span>{character_0_name} </span>
                        <span>{character_1_name} </span>
                        <br />
                        --------------------------------
                        
                    </div>
                    </div>
                );
            }
        });
    }
   
    useInterval(async () => {
        // console.log("Polling Game")
        return await getGameAPI();
    }, 7000);
   
    return (
        <div>
            <h1>Game Page for {gameidURL}</h1>
            <p>{game.numPlayers}</p>
            {/* <div>{game.players.map(p => (<span>{p} </span>))}</div> */}
            {playersToRender}
        </div>
    );

}



export default Coop;

