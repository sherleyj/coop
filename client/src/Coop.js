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

function Coop() {

    const { gameidurl } = useParams(); 
    // const [gameId, setGameId] = useState(gameidurl);
    const [game, setGame]= useContext(GameContext);

    console.log("first to render in COOP, gameidurl: ", gameidurl);


    useEffect (() => {
        if (!game.gameId || game.gameId != gameidurl || Object.entries(game).length === 0){
            console.log("COOP: game not set, grabbing it! ", gameidurl );
            game.gameId = gameidurl;
            setGame(game);
            getGameAPI();
        }

      }, []);

    const getGameAPI = async () => {
        try {
            const data = await fetch(
                'http://localhost:9000/getGame/' + game.gameId
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
        
        let link = "/" + gameidurl + "/player/" + p.id;
        return (
            <div key={p.id} className="player">
                <Link to={link}>Player {p.id}</Link>
                <p>Num coins: {p.coins}</p>
            </div>
        );
    });
    }
    
    return (
        <div>
            <h1>Game Page for {gameidurl}</h1>
            <p>{game.numPlayers}</p>
            {/* <div>{game.players.map(p => (<span>{p} </span>))}</div> */}
            {playersToRender}
        </div>
    );

}



export default Coop;

