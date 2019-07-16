export default function reducer(state = {
  cards: [],
  gameName: null,
  blueTurn: false,
  redCards: 0,
  blueCards: 0,
  winner: null,
  blueTeamFirst: false,
  hardMode: false,
  duetMode: false,
  duet: {
    teamOneTurn: true,
    winner: null,
    cardsLeft: 15,
    timerTokens: 9,
    bystanders: 9
  }
}, action)
{
  switch (action.type)
  {
    case 'LOAD_GAME_FULFILLED':
    {
      const newData = action.payload.data;
      return Object.assign({}, state, newData);
    }
    case 'UPDATE_GAME':
    {
      const newData = action.payload;
      return Object.assign({}, state, newData);
    }
    default:
    {
      return state;
    }
  }
}