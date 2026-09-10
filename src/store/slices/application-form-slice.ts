import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { resolveAppliedFields } from "@/lib/applications/follow-up";
import {
  emptyFormValues,
  type ApplicationFormValues,
} from "@/lib/applications/form";
import type { ApplicationStatus } from "@/types/application";

export type ApplicationFormState = {
  values: ApplicationFormValues;
  extracting: boolean;
  error: string | null;
  connected: boolean;
  followUpWasSuggested: boolean;
  initialAppliedAt: string | null;
  baselineDescription: string;
};

export const applicationFormInitialState: ApplicationFormState = {
  values: emptyFormValues(),
  extracting: false,
  error: null,
  connected: false,
  followUpWasSuggested: false,
  initialAppliedAt: null,
  baselineDescription: "",
};

export type ApplicationFormHydratePayload = {
  values: ApplicationFormValues;
  connected: boolean;
  initialAppliedAt: string | null;
};

const applicationFormSlice = createSlice({
  name: "applicationForm",
  initialState: applicationFormInitialState,
  reducers: {
    hydrate(state, action: PayloadAction<ApplicationFormHydratePayload>) {
      state.values = action.payload.values;
      state.connected = action.payload.connected;
      state.initialAppliedAt = action.payload.initialAppliedAt;
      state.baselineDescription = action.payload.values.raw_description;
      state.extracting = false;
      state.error = null;
      state.followUpWasSuggested = false;
    },
    reset() {
      return applicationFormInitialState;
    },
    setField(
      state,
      action: PayloadAction<{
        key: keyof ApplicationFormValues;
        value: ApplicationFormValues[keyof ApplicationFormValues];
      }>,
    ) {
      const { key, value } = action.payload;
      if (key === "follow_up_date" && !String(value).trim()) {
        state.followUpWasSuggested = false;
      }
      state.values = { ...state.values, [key]: value };
    },
    statusChanged(state, action: PayloadAction<ApplicationStatus>) {
      const status = action.payload;
      const resolved = resolveAppliedFields(
        status,
        state.initialAppliedAt,
        state.values.follow_up_date,
        state.values.status,
      );
      const suggested =
        status === "Applied" &&
        !state.values.follow_up_date.trim() &&
        resolved.follow_up_date.length > 0;
      if (suggested) {
        state.followUpWasSuggested = true;
      }
      state.values.status = status;
      state.values.follow_up_date = resolved.follow_up_date;
    },
    setExtracting(state, action: PayloadAction<boolean>) {
      state.extracting = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    applyExtraction(state, action: PayloadAction<ApplicationFormValues>) {
      state.values = action.payload;
    },
  },
});

export const {
  hydrate: hydrateApplicationForm,
  reset: resetApplicationForm,
  setField,
  statusChanged,
  setExtracting,
  setError,
  setConnected,
  applyExtraction,
} = applicationFormSlice.actions;

export default applicationFormSlice.reducer;
