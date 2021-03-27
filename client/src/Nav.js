import React, {useContext} from 'react';
import './App.css';
import { Link } from 'react-router-dom'
import { GameContext } from './GameContext';


function Nav() {

    const [game, setGame]= useContext(GameContext);

    console.log("FROM NAV, game.gameid: " , game.gameId)
    if (game.gameId) {
        return (
            <nav className="nav">
                <Link className="nav-lnk" to='/'>
                    <h3>Home</h3>
                </Link>
                <Link className="nav-lnk" to={"/".concat(game.gameId)}>
                    <h3>{game.gameId}</h3>
                </Link>
            </nav>
        )
    }
    return (
        <nav className="nav">
            <Link className="nav-lnk" to='/'>
                <h3>Home</h3>
            </Link>
            <Link className="nav-lnk" to='/${}'>
                    <h3>{}</h3>
            </Link>
        </nav>
    );
}

export default Nav;

