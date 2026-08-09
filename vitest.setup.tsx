import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }
  ) {
    const { fill: _fill, ...rest } = props;
    return React.createElement("img", rest);
  },
}));

vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return React.createElement("a", { href, ...props }, children);
  },
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
