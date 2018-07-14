import axios from 'axios';
import { serverUrl } from '../config/serverUrl';

axios.defaults.baseURL = serverUrl;

export function loadGame(gameName)
{
  return {
    type: 'LOAD_GAME',
    payload: axios.get(gameName)
  };
}

export function updateGame(game)
{
  return {
    type: 'UPDATE_GAME',
    payload: game
  };
}

export function startNewGame(gameName, expansions)
{
  axios.post(gameName + '/newGame', {
    gameName,
    expansions
  });
}

export function endTurn(gameName)
{
  axios.get(gameName + '/endTurn');
}

export function cardClick(gameName, cardIndex, teamClicked)
{
  axios.post(gameName + '/cardClicked', {
    cardIndex,
    teamClicked
  })
}