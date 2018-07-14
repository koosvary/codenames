import React, { Component } from 'react';
import history from '../history';

export default class Menu extends Component
{
  constructor(props)
  {
    super(props);
    
    this.startGame = this.startGame.bind(this);
  }
  
  render()
  {
    return (
      <div id="game-menu">
        <p className="spiel">To join a lobby, enter the game name and click 'Go.'</p>
        <input type="text" id="game-name" onKeyPress={this.handleKeyPress} />
        <button onClick={this.startGame}>Go</button>
      </div>
    );
  }
  
  startGame()
  {
    const gameName = document.getElementById('game-name').value;
    history.push('/'+ gameName)

  }

  handleKeyPress = (e) =>
  {
    if (e.key === 'Enter')
    {
      this.startGame();
    }
  }
}