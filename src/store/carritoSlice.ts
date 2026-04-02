import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Producto } from "@/tipos/producto";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface EstadoCarrito {
  items: ItemCarrito[];
  cantidadTotal: number;
  precioTotal: number;
}

const estadoInicial: EstadoCarrito = {
  items: [],
  cantidadTotal: 0,
  precioTotal: 0,
};

const carritoSlice = createSlice({
  name: "carrito",
  initialState: estadoInicial,
  reducers: {
    agregarAlCarrito: (state, action: PayloadAction<Producto>) => {
      const productoExistente = state.items.find(
        (item) => item.producto.id === action.payload.id
      );

      if (productoExistente) {
        productoExistente.cantidad += 1;
      } else {
        state.items.push({ producto: action.payload, cantidad: 1 });
      }

      state.cantidadTotal += 1;
      state.precioTotal += action.payload.precio;
    },

    eliminarDelCarrito: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(
        (item) => item.producto.id === action.payload
      );

      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        state.cantidadTotal -= item.cantidad;
        state.precioTotal -= item.producto.precio * item.cantidad;
        state.items.splice(itemIndex, 1);
      }
    },

    limpiarCarrito: (state) => {
      state.items = [];
      state.cantidadTotal = 0;
      state.precioTotal = 0;
    },
  },
});

export const { agregarAlCarrito, eliminarDelCarrito, limpiarCarrito } =
  carritoSlice.actions;
export default carritoSlice.reducer;
