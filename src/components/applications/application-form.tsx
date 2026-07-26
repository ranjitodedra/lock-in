"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { LoginWithChatGPT } from "@/components/codex/login-with-chatgpt";
import {
  createApplication,
  updateApplication,
  type UpdateApplicationResult,
} from "@/lib/applications/actions";
import {
  MAX_RAW_DESCRIPTION,
  type ApplicationFormValues,
} from "@/lib/applications/form";
import {
  FOLLOW_UP_CALENDAR_DAYS,
  resolveAppliedFields,
} from "@/lib/applications/follow-up";
import { extractionToFormValues } from "@/lib/extraction/map";
import { pollExtractionJob } from "@/lib/extraction/poll";
import type { ApplicationRow } from "@/types/application";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type WorkMode,
} from "@/types/application";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ApplicationFormProps = {
  mode: "create" | "edit";
  initialValues: ApplicationFormValues;
  applicationId?: string;
  initialAppliedAt?: string | null;
  emailVerified: boolean;
  chatGptConnected: boolean;
  layout?: "page" | "detail";
  rawDescriptionAt?: "top" | "bottom";
  redirectOnSave?: boolean;
  formId?: string;
  onSaved?: (application: ApplicationRow) => void;
  onPendingChange?: (pending: boolean) => void;
};

function ExtractSkeletonOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 rounded-xl bg-background/80 backdrop-blur-[1px]"
      aria-hidden
    >
      <div className="flex h-full flex-col gap-3 p-6">
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function ExtractableSection({
  extracting,
  children,
}: {
  extracting: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative space-y-6">
      {extracting ? <ExtractSkeletonOverlay /> : null}
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function ApplicationForm({
  mode,
  initialValues,
  applicationId,
  initialAppliedAt = null,
  emailVerified,
  chatGptConnected,
  layout = "page",
  rawDescriptionAt = "top",
  redirectOnSave = true,
  formId,
  onSaved,
  onPendingChange,
}: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [baselineDescription] = useState(initialValues.raw_description);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [connected, setConnected] = useState(chatGptConnected);
  const [followUpWasSuggested, setFollowUpWasSuggested] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mountedAtRef = useRef(Date.now());
  const extractAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      extractAbortRef.current?.abort();
    };
  }, []);

  const descriptionTrimmed = values.raw_description.trim();
  const descriptionTooLong = values.raw_description.length > MAX_RAW_DESCRIPTION;
  const canExtract =
    descriptionTrimmed.length > 0 && !descriptionTooLong && !extracting;
  const showReExtract =
    mode === "edit" && values.raw_description !== baselineDescription;
  const isDetailLayout = layout === "detail";
  const descriptionTitle =
    rawDescriptionAt === "bottom" ? "Original posting" : "Job description";

  async function handleExtract() {
    if (!canExtract) return;

    extractAbortRef.current?.abort();
    const abort = new AbortController();
    extractAbortRef.current = abort;

    setExtracting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDescription: values.raw_description }),
        signal: abort.signal,
      });

      const data = (await res.json().catch(() => null)) as
        | { jobId: string }
        | { error: string; message?: string }
        | null;

      if (!res.ok) {
        const err = data && "error" in data ? data : null;
        toast.error(
          err?.message ?? "Extraction failed. Try again or fill in fields manually.",
        );
        return;
      }

      if (!data || !("jobId" in data) || !data.jobId) {
        toast.error("Extraction failed. Try again or fill in fields manually.");
        return;
      }

      const pollResult = await pollExtractionJob(data.jobId, abort.signal);
      if (pollResult.kind === "completed") {
        setValues((prev) => extractionToFormValues(pollResult.data, prev));
        toast.success("Fields extracted. Review before saving.");
        return;
      }
      if (pollResult.kind === "failed") {
        toast.error(pollResult.message);
        return;
      }
      toast.error("Extraction timed out. Try again.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      toast.error("Extraction failed. Try again or fill in fields manually.");
    } finally {
      if (extractAbortRef.current === abort) {
        extractAbortRef.current = null;
      }
      if (!abort.signal.aborted) {
        setExtracting(false);
      }
    }
  }

  function update<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K],
  ) {
    if (key === "follow_up_date" && !String(value).trim()) {
      setFollowUpWasSuggested(false);
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleStatusChange(status: ApplicationStatus) {
    const resolved = resolveAppliedFields(
      status,
      initialAppliedAt,
      values.follow_up_date,
      values.status,
    );
    const suggested =
      status === "Applied" &&
      !values.follow_up_date.trim() &&
      resolved.follow_up_date.length > 0;
    if (suggested) {
      setFollowUpWasSuggested(true);
    }
    setValues((prev) => ({
      ...prev,
      status,
      follow_up_date: resolved.follow_up_date,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDetailLayout && Date.now() - mountedAtRef.current < 250) {
      return;
    }
    setError(null);

    if (!emailVerified) {
      setError("Verify your email before saving applications.");
      return;
    }

    if (values.raw_description.length > MAX_RAW_DESCRIPTION) {
      setError(
        `Job description must be ${MAX_RAW_DESCRIPTION.toLocaleString()} characters or fewer.`,
      );
      return;
    }

    startTransition(async () => {
      onPendingChange?.(true);

      if (mode === "create") {
        const result = await createApplication(values);
        onPendingChange?.(false);
        if (result && "error" in result) {
          setError(result.error);
        }
        return;
      }

      const result: UpdateApplicationResult = await updateApplication(
        applicationId!,
        values,
        { shouldRedirect: redirectOnSave },
      );
      onPendingChange?.(false);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (!redirectOnSave) {
        onSaved?.(result.application);
        toast.success("Changes saved.");
      }
    });
  }

  const jobDescriptionCard = (
    <Card>
      <CardHeader>
        <CardTitle>{descriptionTitle}</CardTitle>
        {rawDescriptionAt === "top" ? (
          <CardDescription>
            Paste the full posting, then extract fields with your ChatGPT
            account or fill them in manually.
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Raw job description" htmlFor="raw_description">
          <Textarea
            id="raw_description"
            value={values.raw_description}
            onChange={(e) => update("raw_description", e.target.value)}
            rows={8}
            placeholder="Paste the full job posting here…"
            disabled={extracting}
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          {values.raw_description.length.toLocaleString()} /{" "}
          {MAX_RAW_DESCRIPTION.toLocaleString()} characters
        </p>

        {connected ? (
          <Button
            type="button"
            variant="brand"
            onClick={handleExtract}
            disabled={!canExtract}
          >
            {extracting
              ? "Extracting…"
              : showReExtract
                ? "Re-extract fields"
                : "Extract fields"}
          </Button>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Connect ChatGPT to extract fields from your posting.
            </p>
            <LoginWithChatGPT onConnected={() => setConnected(true)} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const fieldCards = (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Core</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company">
            <Input
              id="company"
              value={values.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </Field>
          <Field label="Role" htmlFor="job_title">
            <Input
              id="job_title"
              value={values.job_title}
              onChange={(e) => update("job_title", e.target.value)}
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select
              value={values.status}
              onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Work mode" htmlFor="work_mode">
            <Select
              value={values.work_mode || "none"}
              onValueChange={(v) =>
                update("work_mode", v === "none" ? "" : (v as WorkMode))
              }
            >
              <SelectTrigger id="work_mode" className="w-full">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input
              id="country"
              value={values.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Application deadline" htmlFor="application_deadline">
            <Input
              id="application_deadline"
              type="date"
              value={values.application_deadline}
              onChange={(e) => update("application_deadline", e.target.value)}
            />
          </Field>
          <Field label="Follow-up date" htmlFor="follow_up_date">
            <Input
              id="follow_up_date"
              type="date"
              value={values.follow_up_date}
              onChange={(e) => update("follow_up_date", e.target.value)}
            />
            {followUpWasSuggested && values.follow_up_date ? (
              <p className="text-xs text-muted-foreground">
                Suggested: {FOLLOW_UP_CALENDAR_DAYS} days after applying. You can
                change this.
              </p>
            ) : null}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation & type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Salary" htmlFor="salary">
            <Input
              id="salary"
              value={values.salary}
              onChange={(e) => update("salary", e.target.value)}
              placeholder="e.g. $120k–$150k"
            />
          </Field>
          <Field label="Employment type" htmlFor="employment_type">
            <Input
              id="employment_type"
              value={values.employment_type}
              onChange={(e) => update("employment_type", e.target.value)}
              placeholder="e.g. Full-time"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Skills" htmlFor="skills">
            <Input
              id="skills"
              value={values.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="Comma-separated"
            />
          </Field>
          <Field label="Technologies" htmlFor="technologies">
            <Input
              id="technologies"
              value={values.technologies}
              onChange={(e) => update("technologies", e.target.value)}
              placeholder="Comma-separated"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Experience required" htmlFor="experience_required">
            <Textarea
              id="experience_required"
              value={values.experience_required}
              onChange={(e) => update("experience_required", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Education" htmlFor="education">
            <Textarea
              id="education"
              value={values.education}
              onChange={(e) => update("education", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Responsibilities" htmlFor="responsibilities">
            <Textarea
              id="responsibilities"
              value={values.responsibilities}
              onChange={(e) => update("responsibilities", e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Qualifications" htmlFor="qualifications">
            <Textarea
              id="qualifications"
              value={values.qualifications}
              onChange={(e) => update("qualifications", e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Benefits" htmlFor="benefits">
            <Textarea
              id="benefits"
              value={values.benefits}
              onChange={(e) => update("benefits", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Summary" htmlFor="summary">
            <Textarea
              id="summary"
              value={values.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter & links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Recruiter name" htmlFor="recruiter_name">
            <Input
              id="recruiter_name"
              value={values.recruiter_name}
              onChange={(e) => update("recruiter_name", e.target.value)}
            />
          </Field>
          <Field label="Recruiter email" htmlFor="recruiter_email">
            <Input
              id="recruiter_email"
              type="email"
              value={values.recruiter_email}
              onChange={(e) => update("recruiter_email", e.target.value)}
            />
          </Field>
          <Field label="Recruiter phone" htmlFor="recruiter_phone">
            <Input
              id="recruiter_phone"
              value={values.recruiter_phone}
              onChange={(e) => update("recruiter_phone", e.target.value)}
            />
          </Field>
          <Field label="Apply URL" htmlFor="apply_url">
            <Input
              id="apply_url"
              type="url"
              value={values.apply_url}
              onChange={(e) => update("apply_url", e.target.value)}
            />
          </Field>
          <Field label="Company website" htmlFor="company_website">
            <Input
              id="company_website"
              type="url"
              value={values.company_website}
              onChange={(e) => update("company_website", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Visa sponsorship" htmlFor="visa_sponsorship">
            <Select
              value={values.visa_sponsorship || "unknown"}
              onValueChange={(v) =>
                update(
                  "visa_sponsorship",
                  v === "unknown" ? "" : (v as "yes" | "no"),
                )
              }
            >
              <SelectTrigger id="visa_sponsorship" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>
    </>
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={
        isDetailLayout
          ? "mx-auto max-w-3xl space-y-6 pb-8"
          : "mx-auto max-w-3xl space-y-6"
      }
    >
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!emailVerified ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-50">
          Verify your email before saving applications. You can fill out the
          form now and save after verification.
        </p>
      ) : null}

      {rawDescriptionAt === "top" ? jobDescriptionCard : null}

      <ExtractableSection extracting={extracting}>
      {fieldCards}
      </ExtractableSection>

      {rawDescriptionAt === "bottom" ? jobDescriptionCard : null}

      {!isDetailLayout ? (
      <div className="flex flex-wrap gap-3 pb-6">
        <Button type="submit" variant="brand" disabled={!emailVerified || isPending || extracting}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Save application"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={<Link href="/dashboard" />}
          nativeButton={false}
        >
          Cancel
        </Button>
      </div>
      ) : null}
    </form>
  );
}
