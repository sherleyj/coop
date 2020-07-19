import React from 'react';
import './App.css';
import { Link } from 'react-router-dom'

function Nav() {

    return (
        <nav>
            <Link to='/'>
                <h3>Create New Room</h3>
            </Link>
        </nav>
    );
}

export default Nav;

