import assert from "node:assert/strict";

import { jobToPollResponse } from "@/lib/extraction/job-status";

assert.deepEqual(jobToPollResponse({
  status: "pending",
  result: null,
  error_code: null,
  error_message: null,
}), { status: "pending" });

assert.deepEqual(jobToPollResponse({
  status: "processing",
  result: null,
  error_code: null,
  error_message: null,
}), { status: "processing" });

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

const completed = jobToPollResponse({
  status: "completed",
  result: sample,
  error_code: null,
  error_message: null,
});
assert.equal(completed.status, "completed");
if (completed.status === "completed") {
  assert.equal(completed.data.company, "Acme");
}

assert.deepEqual(jobToPollResponse({
  status: "failed",
  result: null,
  error_code: "not_a_job_posting",
  error_message: "Not a job posting.",
}), {
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
assert.equal(badCompleted.status, "failed");

console.log("job-status self-check passed");
