import { combineReducers } from '@reduxjs/toolkit';
import helpDeskSlice from '../slice/helpDeskSlice';

const MainReducer = combineReducers(
  {
    helpDeskSlice:  helpDeskSlice,
  }
);

const RootReducer = (state, action) => {  
  return MainReducer(state, action);
}
export default RootReducer;
