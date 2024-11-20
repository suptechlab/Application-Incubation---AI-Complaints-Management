import { combineReducers } from '@reduxjs/toolkit';
import helpDeskSlice from '../slice/helpDeskSlice';
import authSlice from '../slice/authSlice'
import masterSlice from '../slice/masterSlice'
const MainReducer = combineReducers(
  {
    helpDeskSlice:  helpDeskSlice,
    authSlice : authSlice,
    masterSlice : masterSlice
  }
);

const RootReducer = (state, action) => {  
  return MainReducer(state, action);
}
export default RootReducer;
