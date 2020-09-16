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
    // const [gameId, setGameId] = useState(gameidURL);
    const [game, setGame]= useContext(GameContext);

    console.log("first to render in COOP, gameidURL: ", gameidURL);


    useEffect (() => {
        if (!game.gameId || game.gameId !== gameidURL || Object.entries(game).length === 0){
            console.log("COOP: game not set, grabbing it! ", gameidURL );
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
            })
    
            console.log("GETGAME, gameFromAPI:", gameFromAPI)
        } catch (e) {
            console.log(e);
            return <div>Error: {e.message}</div>;
        }
    }; 

    let playersToRender = "";
    if (game.players) {
        playersToRender =  game.players.map((p) => {
            let turnText = "";
            let playerid = p.id + 1;
            if (p.turn) {
                turnText = "Your turn!"
            }
            let link = "/" + gameidURL + "/player/" + playerid;
            return (
                <div key={p.id} className="player">
                    <Link to={link}>Player {playerid}</Link> <span>{turnText}</span>
                    <p>Num coins: {p.coins}</p>
                </div>
            );
        });
    }
   
    useInterval(async () => {
        console.log("Polling Game")
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

