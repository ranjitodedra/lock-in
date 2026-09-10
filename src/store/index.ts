import { combineReducers, configureStore } from "@reduxjs/toolkit";

import applicationFormReducer from "@/store/slices/application-form-slice";
import dashboardReducer from "@/store/slices/dashboard-slice";

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  applicationForm: applicationFormReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type PreloadedRootState = Partial<RootState>;
