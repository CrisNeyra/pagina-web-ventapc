import { configureStore } from "@reduxjs/toolkit";
import carritoReducer from "./carritoSlice";

export const store = configureStore({
  reducer: {
    carrito: carritoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
