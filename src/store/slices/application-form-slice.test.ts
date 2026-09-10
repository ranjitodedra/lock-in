import { describe, expect, it } from "vitest";

import { emptyFormValues } from "@/lib/applications/form";
import { makeStore } from "@/store";
import {
  applicationFormInitialState,
  applyExtraction,
  hydrateApplicationForm,
  resetApplicationForm,
  setConnected,
  setExtracting,
  setField,
  statusChanged,
} from "@/store/slices/application-form-slice";

describe("applicationForm slice", () => {
  it("hydrates values and connection, then resets", () => {
    const store = makeStore();
    const values = { ...emptyFormValues(), company: "Acme" };
    store.dispatch(
      hydrateApplicationForm({
        values,
        connected: true,
        initialAppliedAt: null,
      }),
    );
    expect(store.getState().applicationForm.values.company).toBe("Acme");
    expect(store.getState().applicationForm.connected).toBe(true);
    expect(store.getState().applicationForm.baselineDescription).toBe("");

    store.dispatch(resetApplicationForm());
    expect(store.getState().applicationForm).toEqual(applicationFormInitialState);
  });

  it("updates a field and applies extraction output", () => {
    const store = makeStore();
    store.dispatch(
      hydrateApplicationForm({
        values: emptyFormValues(),
        connected: true,
        initialAppliedAt: null,
      }),
    );
    store.dispatch(setField({ key: "raw_description", value: "Pasted job" }));
    store.dispatch(
      applyExtraction({
        ...emptyFormValues(),
        raw_description: "Pasted job",
        company: "Acme",
        job_title: "Engineer",
      }),
    );
    expect(store.getState().applicationForm.values.company).toBe("Acme");
    expect(store.getState().applicationForm.values.raw_description).toBe("Pasted job");
  });

  it("suggests follow-up when status changes to Applied", () => {
    const store = makeStore();
    store.dispatch(
      hydrateApplicationForm({
        values: emptyFormValues(),
        connected: false,
        initialAppliedAt: null,
      }),
    );
    store.dispatch(statusChanged("Applied"));
    expect(store.getState().applicationForm.values.status).toBe("Applied");
    expect(store.getState().applicationForm.values.follow_up_date).toHaveLength(10);
    expect(store.getState().applicationForm.followUpWasSuggested).toBe(true);
  });

  it("tracks extracting and connected flags", () => {
    const store = makeStore();
    store.dispatch(setExtracting(true));
    store.dispatch(setConnected(true));
    expect(store.getState().applicationForm.extracting).toBe(true);
    expect(store.getState().applicationForm.connected).toBe(true);
  });
});
