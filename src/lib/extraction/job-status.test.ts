import { describe, expect, it } from "vitest";

import { jobToPollResponse } from "@/lib/extraction/job-status";

const sample = {
  company: "Acme",
  jobTitle: "Engineer",
  location: null,
  country: null,
  workMode: null,
  employmentType: null,
  salary: null,
  applicationDeadline: null,
  skills: null,
  technologies: null,
  experienceRequired: null,
  education: null,
  responsibilities: null,
  qualifications: null,
  benefits: null,
  visaSponsorship: null,
  recruiterName: null,
  recruiterEmail: null,
  recruiterPhone: null,
  applyUrl: null,
  companyWebsite: null,
  summary: null,
};

describe("jobToPollResponse", () => {
  it("passes through pending and processing", () => {
    expect(
      jobToPollResponse({
        status: "pending",
        result: null,
        error_code: null,
        error_message: null,
      }),
    ).toEqual({ status: "pending" });

    expect(
      jobToPollResponse({
        status: "processing",
        result: null,
        error_code: null,
        error_message: null,
      }),
    ).toEqual({ status: "processing" });
  });

  it("returns parsed data when completed", () => {
    const completed = jobToPollResponse({
      status: "completed",
      result: sample,
      error_code: null,
      error_message: null,
    });
    expect(completed.status).toBe("completed");
    if (completed.status === "completed") {
      expect(completed.data.company).toBe("Acme");
    }
  });

  it("maps failed jobs and invalid completed payloads", () => {
    expect(
      jobToPollResponse({
        status: "failed",
        result: null,
        error_code: "not_a_job_posting",
        error_message: "Not a job posting.",
      }),
    ).toEqual({
      status: "failed",
      error: "not_a_job_posting",
      message: "Not a job posting.",
    });

    const badCompleted = jobToPollResponse({
      status: "completed",
      result: { nope: true },
      error_code: null,
      error_message: null,
    });
    expect(badCompleted.status).toBe("failed");
  });
});
