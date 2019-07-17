export default function reducer(state = {
  role: 'Player',
  colourblind: false,
  duetTeamOne: true,
  selectedExpansions: ['VANILLA'],
  duetTimerTokens: null,
  duetMistakesAllowed: null,
}, action)
{
  switch(action.type)
  {
    case 'CHANGE_ROLE':
    {
      const {role} = action;
      return state = {...state, role};
    }
    case 'TOGGLE_COLOURBLIND':
    {
      return state = {...state, colourblind: !state.colourblind};
    }
    case 'TOGGLE_DUET_TEAM':
    {
      return state = {...state, duetTeamOne: !state.duetTeamOne};
    }
    case 'TOGGLE_EXPANSION':
    {
      let selectedExpansions = state.selectedExpansions.slice();

      if(selectedExpansions.includes(action.expansion))
      {
        selectedExpansions = selectedExpansions.filter(expansion => expansion !== action.expansion)
      }
      else
      {
        selectedExpansions.push(action.expansion);
      }

      return state = {...state, selectedExpansions};
    }
    case 'CHANGE_DUET_TURNS':
    {
      const {turns} = action;
      return state = {...state, duetTimerTokens: turns};
    }
    case 'CHANGE_DUET_MISTAKES':
    {
      const {mistakes} = action;
      return state = {...state, duetMistakesAllowed: mistakes};
    }
    default:
    {
      return state;
    }
  }
}