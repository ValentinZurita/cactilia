import { createSlice } from '@reduxjs/toolkit'

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [] // Array de mensajes {id, type, text}
  },
  reducers: {
    addMessage: (state, action) => {
      const newMessage = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.messages.push(newMessage);
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  }
});

export const { addMessage, removeMessage, clearMessages } = messagesSlice.actions;

// Selector
export const selectMessages = (state) => state.messages.messages;

export default messagesSlice.reducer;