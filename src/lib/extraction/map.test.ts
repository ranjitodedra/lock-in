import { describe, expect, it } from "vitest";

import { emptyFormValues } from "@/lib/applications/form";
import { extractionToFormValues } from "@/lib/extraction/map";
import type { JobExtraction } from "@/types/application";

describe("application form values", () => {
  it("keeps 26 editable fields", () => {
    expect(Object.keys(emptyFormValues())).toHaveLength(26);
  });
});

describe("extractionToFormValues", () => {
  it("maps extraction onto the current form and preserves paste/status/notes", () => {
    const current = {
      ...emptyFormValues(),
      raw_description: "Pasted posting",
      status: "Preparing" as const,
      notes: "Keep me",
      follow_up_date: "2026-09-20",
    };

    const extraction: JobExtraction = {
      company: "Acme",
      jobTitle: "Engineer",
      location: "Remote",
      country: "US",
      workMode: "Remote",
      employmentType: "Full-time",
      salary: "$150k",
      applicationDeadline: "2026-12-01",
      skills: ["React", "TypeScript"],
      technologies: ["Next.js"],
      experienceRequired: "5 years",
      education: "BS",
      responsibilities: "Build things",
      qualifications: "Strong JS",
      benefits: "Health",
      visaSponsorship: true,
      recruiterName: "Alex",
      recruiterEmail: "alex@acme.test",
      recruiterPhone: "555-0100",
      applyUrl: "https://acme.test/jobs/1",
      companyWebsite: "https://acme.test",
      summary: "Great role",
    };

    const mapped = extractionToFormValues(extraction, current);
    expect(mapped.raw_description).toBe("Pasted posting");
    expect(mapped.status).toBe("Preparing");
    expect(mapped.notes).toBe("Keep me");
    expect(mapped.follow_up_date).toBe("2026-09-20");
    expect(mapped.company).toBe("Acme");
    expect(mapped.job_title).toBe("Engineer");
    expect(mapped.skills).toBe("React, TypeScript");
    expect(mapped.visa_sponsorship).toBe("yes");
  });
});
