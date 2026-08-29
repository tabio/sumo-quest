import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// テストごとにDOMを破棄し、状態が次のテストへ漏れないようにする。
afterEach(() => {
  cleanup();
});
