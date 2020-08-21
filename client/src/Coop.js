import React, { 
    useState,
    useEffect,
} from 'react';
import './App.css';
import { 
    useParams,
    Link,
} from "react-router-dom";

function Coop() {
    
    useEffect (() => {
        getGame();
    }, []);

    const { gameidurl } = useParams(); 
    const [gameId, setGameId] = useState(gameidurl);
    const [game, setGame] = useState({"gameId":gameId,"numPlayers":0,"challenge":false,"players":[],"characters":[]});

    // useEffect (() => {
    //     if (game.players) {
    //         console.log("useEffect", game.players[0]);
    //         console.log("useEffect", game);
    //     }
    // }, [game]);

    const getGame = async () => {
        try {
            const data = await fetch(
                'http://localhost:9000/game/' + gameId
            );

            const gameFromAPI = await data.json(); 
            console.log(gameFromAPI);
            
            setGame(gameFromAPI);

            console.log("****** getGame:  " +  gameFromAPI.gameId);
            console.log("****** getGame:  " +  gameFromAPI.players[0]);
            // console.log("****** getGame:  game.players[i]: " +  game.players[i]);



            // setPlayers(gameFromAPI.players);
            // playersToRender();
        } catch (e) {
            console.log(e);
        }
    };

    let playersToRender =  game.players.map((p) => {
        
        let link = "/" + gameidurl + "/player/" + p.id;
        return (
            <div key={p.id} className="player">
                <Link to={link}>Player {p.id}</Link>
                <p>Num coins: {p.coins}</p>
            </div>
        );
    });


    return (
        <div>
            <h1>Game Page for {gameId}</h1>
            <p>{game.numPlayers}</p>
            {/* <div>{game.players.map(p => (<span>{p} </span>))}</div> */}
            {playersToRender}
        </div>
    );

}



export default Coop;

