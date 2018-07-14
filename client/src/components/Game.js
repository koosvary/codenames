import React, { Component } from 'react';
import io from "socket.io-client";

import Board from './Board';
import { connect } from 'react-redux';

import { toggleExpansion, changeRole, toggleColourblind, toggleNightMode } from '../actions/userOptionsActions';
import { updateGame, loadGame, startNewGame, endTurn, cardClick } from '../actions/gameActions';
import { socketUrl } from '../config/serverUrl';

const stateMap = (store) => {

  return store;
};

class Game extends Component
{
  constructor(props)
  {
    super(props);

    this.toggleWordPack = this.toggleWordPack.bind(this);
    this.highlightIfClicked = this.highlightIfClicked.bind(this);
    this.newGame = this.newGame.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.changeRole = this.changeRole.bind(this);
    this.toggleColourblind = this.toggleColourblind.bind(this);
    this.toggleNightMode = this.toggleNightMode.bind(this);

    // Get game name from URL
    const gameName = window.location.pathname.split('/')[1];

    // Socket room and connection
    let socket = io.connect(socketUrl);

    socket.emit('joinRoom', gameName);

    socket.on('updateGame', game => props.dispatch(updateGame(game)));
    
    this.loadGame(gameName);
  }

  render()
  {
    const winner = this.props.game.winner;

    let status;
    const playingTeam = (this.props.game.blueTurn ? 'blue' : 'red');
    if (winner)
    {
      status = winner + ' team wins!';
    }
    else
    {
      status = (this.props.game.blueTurn ? 'Blue' : 'Red') + ' team\'s turn';
    }

    const game = this.createScoreboard();

    return (
      <div className={
          (this.props.options.role === 'Spymaster' ? 'spymaster' : 'player') + 
          (this.props.options.colourblind ? ' colourblind' : '') + 
          (this.props.options.nightMode ? ' night-mode' : '')
        } id="game">
        <div id="board">
          <div id="top-bar">
            <div id="score">
              <span className={game.firstTeamColour}>{game.firstTeamScore}</span>
              <span>&ndash;</span>
              <span className={game.secondTeamColour}>{game.secondTeamScore}</span>
            </div>
            <div id="status" className={playingTeam}>{status}</div>
            {!this.props.game.winner && <button id="end-turn" onClick={this.endTurn}>End {playingTeam}&apos;s turn</button>}
          </div>
          <Board
            cards={this.props.game.cards}
            cardClick={(i) => this.cardClick(i)}
          />
          <div id="bottom-bar" className={this.props.options.role === 'Spymaster' ? 'spymaster-selected' : 'player-selected'}>
            <div className="left">
              <div id="switch-input">
                <div className="switch-label">Colourblind</div>
                <label className="switch">
                  <input type="checkbox" onChange={this.toggleColourblind} />
                  <span className="slider round"></span>
                </label>
              </div>
              {/* <div id="switch-input">
                <div className="switch-label">Night Mode</div>
                <label className="switch">
                  <input type="checkbox" onChange={this.toggleColourblind} />
                  <span className="slider round"></span>
                </label>
              </div> */}
            </div>
            <div className="right">
              <div id="switch-input">
                <div className="switch-label">Spymaster</div>
                <label className="switch">
                    <input type="checkbox" value={this.props.options.role === 'Spymaster' ? 'Player' : 'Spymaster'} onChange={this.changeRole} />
                  <span className="slider round"></span>
                </label>
              </div>
              <button id="next-game" onClick={this.newGame}>Next game</button>
            </div>
          </div>
          <div id="expansions">
            <div id="instruction">Select your word packs</div>
            <div>
              <input id="vanilla" value="vanilla" className={"expansion" + this.highlightIfClicked('VANILLA')} type="image" src="/images/vanilla.png" alt="Base Game" onClick={this.toggleWordPack} />
              <input id="duet" value="duet" className={"expansion" + this.highlightIfClicked('DUET')} type="image" src="/images/duet.png" alt="Duet" onClick={this.toggleWordPack} />
              <input id="undercover" value="undercover" className={"expansion" + this.highlightIfClicked('UNDERCOVER')} type="image" src="/images/deep_undercover.png" alt="Deep Undercover" onClick={this.toggleWordPack} />
            </div>
            <div id="words-changed" className="hidden">Your word packs will be used in the next game</div>
          </div>
        </div>
      </div>
    );
  }

  /* Helper/dispatch functions */
  /* Client actions */
  highlightIfClicked(expansion)
  {
    // Toggle .selected class on expansion
    if(this.props.options.selectedExpansions.includes(expansion))
    {
      return ' selected';
    }
    return '';
  }

  // Score CSS classes and info
  createScoreboard()
  {
    let firstTeamColour;
    let firstTeamScore;
    let secondTeamColour;
    let secondTeamScore;
    if (this.props.game.blueTeamFirst)
    {
      firstTeamColour = 'blue';
      firstTeamScore = this.props.game.blueCards;
      secondTeamColour = 'red';
      secondTeamScore = this.props.game.redCards;
    }
    else
    {
      firstTeamColour = 'red';
      firstTeamScore = this.props.game.redCards;
      secondTeamColour = 'blue';
      secondTeamScore = this.props.game.blueCards;
    }

    return {firstTeamColour, firstTeamScore, secondTeamColour, secondTeamScore};
  }

  changeRole(event)
  {
    let el = event.target;

    this.props.dispatch(changeRole(el.value))
  }

  toggleColourblind()
  {
    this.props.dispatch(toggleColourblind());
  }

  toggleNightMode()
  {
    this.props.dispatch(toggleNightMode());
  }

  toggleWordPack(event)
  {
    // Add helper text
    let spiel = document.getElementById('words-changed');
    spiel.classList.remove('hidden');

    // Get the expansion clicked and obtain its value
    let el = event.target;
    this.props.dispatch(toggleExpansion(el.value.toUpperCase()));
  }
  
  /* Server actions */
  loadGame(gameName)
  {    
    this.props.dispatch(loadGame(gameName));
  }

  newGame()
  {
    startNewGame(this.props.game.gameName, this.props.options.selectedExpansions);
  }
  
  cardClick(cardIndex)
  {
    const cards = this.props.game.cards.slice();

    if (this.props.game.winner || cards[cardIndex].clicked || this.props.options.role === 'Spymaster')
    {
      return;
    }

    const teamClicked = this.props.game.blueTurn ? 'Blue' : 'Red';

    cardClick(this.props.game.gameName, cardIndex, teamClicked);
  }

  endTurn()
  {
    endTurn(this.props.game.gameName);
  }
}

export default connect(stateMap)(Game);