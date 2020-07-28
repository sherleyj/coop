import React, { useState,
                useEffect,
} from 'react';
import './App.css';
import { 
    useParams,
} from "react-router-dom";

function Coop() {
    const { gameidurl } = useParams();
    const [gameId, setGameId] = useState(gameidurl);

    useEffect (() => {
        getGame();
    });

    const getGame = async () => {
        const data = await fetch(
            'http://localhost:9000/game/' + gameId
        );

        const gameIdFromAPI = await data.json();
        console.log(gameIdFromAPI.gameid);
    };

    return (
        <div>
            <h1>Game Page for {gameId}</h1>
        </div>
    );

}



export default Coop;

