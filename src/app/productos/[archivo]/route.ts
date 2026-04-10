import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const urlPlaceholder = new URL("/placeholder-producto.svg", request.url);
  return NextResponse.redirect(urlPlaceholder);
}
