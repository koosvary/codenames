export default function reducer(state = {
  role: 'Player',
  colourblind: false,
  duetTeamOne: true,
  selectedExpansions: ['VANILLA']
}, action)
{
  switch(action.type)
  {
    case 'CHANGE_ROLE':
    {
      const role = action.role;
      console.log(role)
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
    default:
    {
      return state;
    }
  }
}