import React, { Component } from 'react';
import history from '../history';

export default class Menu extends Component
{  
  render()
  {
    return (
      <div id="game-menu">
        <p className="spiel">To join a lobby, enter the game name and click 'Go.'</p>
        <input type="text" id="game-name" onInput={this.sanitizeGameName} onKeyPress={this.handleKeyPress} />
        <button onClick={this.startGame}>Go</button>
      </div>
    );
  }
  
  startGame = () =>
  {
    let gameName = document.getElementById('game-name').value.replace(/-+$/, "");

    // Remove trailing slashes
    gameName = gameName.replace(/-+$/, "");

    history.push('/'+ gameName)
  }

  sanitizeGameName = (e) => {
    let gameName = document.getElementById('game-name').value;
    gameName = gameName.replace(' ', '-')
    gameName = gameName.replace('/', '-')
    gameName = gameName.replace(';', '-')
    gameName = gameName.replace(':', '-')
    gameName = gameName.toLowerCase();
    document.getElementById('game-name').value = gameName;
  }

  handleKeyPress = (e) =>
  {
    if (e.key === 'Enter')
    {
      this.startGame();
    }
  }
}