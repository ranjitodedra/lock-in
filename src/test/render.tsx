import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import { makeStore, type PreloadedRootState } from "@/store";

export function renderWithStore(
  ui: ReactElement,
  preloadedState?: PreloadedRootState,
) {
  const store = makeStore(preloadedState);
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
