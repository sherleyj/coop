import React, {
  useEffect,
  useContext
} from 'react';
import './App.css';
import { GameContext } from './GameContext';
import { useInterval, useGetNestedObject } from './Hooks'

function Characters() {

  [game, setGame] = useContext(GameContext);

  useEffect (() => {
    onsole.log("PLAYER: game not set, grabbing it! ", gameidURL ); 
    getGameAPI();
  }, []);

  useEffect (() => {
    if (Object.entries(game).length !== 0){
      setGameAPI();
    }
  }, [game]);

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

        console.log("getGame, gameFromAPI:", gameFromAPI)
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

      console.log("POST!! coins: ", game.players[playerid].coins);

      const data = await fetch('http://localhost:9000/setGame', requestOptions);
      const gameFromAPI = await data.json();

      console.log("POST!! gameFromAPI coins: ", gameFromAPI.players[playerid].coins);

    } catch (e) {
        console.log(e);
        return <div>Error: {e.message}</div>;
    }
  };  

  const character_0 =  useGetNestedObject(game, ['players', playerid, 'characters', 0, "id"]); 
  const character_1 =  useGetNestedObject(game, ['players', playerid, 'characters', 1, "id"]);

  let steal_players_form = "";
  if (game.players) {
    steal_players_form = game.players.map( (p, i) => {
      if (i != playerid && p.coins > 1) {  // Add active property to player.  Make first active player checked.
        return ( 
          <div>
          <input
            type="radio"
            value={p.id}
            name = {p.id}
            checked={stealFrom == p.id}
            onChange={handleStealChange}
          /> {p.id + 1}
          </div> ) 
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <input 
        type="radio" 
        value={character_0.name}
        onChange={(event) => {setGameId(event.target.value)}}
      />
      <input 
        type="radio" 
        value={character_1.name}
        onChange={(event) => {setGameId(event.target.value)}}
      />
      </form>
    </div>
  );

}

export default Characters;