"use client";

import { Provider } from "react-redux";
import { store } from "@/store";

// Wrapper para envolver la app con el Provider de Redux
export default function ProveedorRedux({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
