import React, {useContext} from 'react';
import './App.css';
import { Link } from 'react-router-dom'
import { GameContext } from './GameContext';


function Nav() {

    const [game, setGame]= useContext(GameContext);

    console.log("FROM NAV, game.gameid: " , game.gameId)
    if (game.gameId) {
        return (
            <nav>
                <Link to='/'>
                    <h3>Home</h3>
                </Link>
                <Link to={"/".concat(game.gameId)}>
                    <h3>{game.gameId}</h3>
                </Link>
            </nav>
        )
    }
    return (
        <nav>
            <Link to='/'>
                <h3>Home</h3>
            </Link>
            <Link to='/${}'>
                    <h3>{}</h3>
            </Link>
        </nav>
    );
}

export default Nav;

