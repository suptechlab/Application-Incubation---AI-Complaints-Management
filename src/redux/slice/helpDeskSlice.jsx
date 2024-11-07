import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chatBotVisible: false,
};

const helpDeskSlice = createSlice({
    name: 'helpDeskChatBot',
    initialState,
    reducers: {
        toggleChatbot: (state) => {
            state.chatBotVisible = !state.chatBotVisible;
        }
    }
});

export const { toggleChatbot } = helpDeskSlice.actions;

export default helpDeskSlice.reducer;