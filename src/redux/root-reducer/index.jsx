import { combineReducers } from '@reduxjs/toolkit';
import helpDeskSlice from '../slice/helpDeskSlice';
import authSlice from '../slice/authSlice'

const MainReducer = combineReducers(
  {
    helpDeskSlice:  helpDeskSlice,
    authSlice : authSlice
  }
);

const RootReducer = (state, action) => {  
  return MainReducer(state, action);
}
export default RootReducer;
