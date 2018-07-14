import { combineReducers } from 'redux';

// Reducers
import game from './gameReducer';
import options from './userOptionsReducer';

export default combineReducers({
  game,
  options
})