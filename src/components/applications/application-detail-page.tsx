"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { ApplicationDetailView } from "@/components/applications/application-detail-view";
import { ApplicationForm } from "@/components/applications/application-form";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteApplication } from "@/lib/applications/actions";
import { rowToFormValues } from "@/lib/applications/form";
import type { ApplicationFormValues } from "@/lib/applications/form";
import type { ApplicationRow } from "@/types/application";

export const APPLICATION_DETAIL_FORM_ID = "application-detail-form";

type ApplicationDetailPageProps = {
  application: ApplicationRow;
  formValues: ApplicationFormValues;
  emailVerified: boolean;
  chatGptConnected: boolean;
};

export function ApplicationDetailPage({
  application: initialApplication,
  formValues: initialFormValues,
  emailVerified,
  chatGptConnected,
}: ApplicationDetailPageProps) {
  const router = useRouter();
  const [application, setApplication] = useState(initialApplication);
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const suppressSaveRef = useRef(false);

  const title =
    application.company?.trim() ||
    application.job_title?.trim() ||
    "Application";
  const subtitle =
    application.company?.trim() && application.job_title?.trim()
      ? application.job_title
      : null;

  function handleEdit() {
    setFormValues(rowToFormValues(application));
    setFormKey((k) => k + 1);
    suppressSaveRef.current = true;
    setTimeout(() => {
      setEditing(true);
      setTimeout(() => {
        suppressSaveRef.current = false;
      }, 150);
    }, 0);
  }

  function handleSaveClick() {
    if (suppressSaveRef.current) return;
    const form = document.getElementById(
      APPLICATION_DETAIL_FORM_ID,
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  function handleCancelEdit() {
    setFormValues(rowToFormValues(application));
    setFormKey((k) => k + 1);
    setEditing(false);
  }

  function handleSaved(updated: ApplicationRow) {
    setApplication(updated);
    setFormValues(rowToFormValues(updated));
    setEditing(false);
    router.refresh();
  }

  function handleDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteApplication(application.id);
      if ("error" in result) {
        setDeleteError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="-m-4 flex min-h-0 flex-1 flex-col md:-m-6">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-background px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 px-2 text-muted-foreground"
              render={<Link href="/dashboard" />}
              nativeButton={false}
            >
              <ArrowLeft data-icon="inline-start" className="size-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  disabled={!emailVerified || isSaving}
                  onClick={handleSaveClick}
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleEdit}>
                  <Pencil data-icon="inline-start" className="size-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="destructive" disabled={isDeleting} />
                    }
                  >
                    <Trash2 data-icon="inline-start" className="size-4" />
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete application?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes{" "}
                        {application.company ||
                          application.job_title ||
                          "this application"}
                        . This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {deleteError ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {deleteError}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6">
        {editing ? (
          <ApplicationForm
            key={formKey}
            mode="edit"
            layout="detail"
            rawDescriptionAt="bottom"
            redirectOnSave={false}
            formId={APPLICATION_DETAIL_FORM_ID}
            applicationId={application.id}
            initialValues={formValues}
            initialAppliedAt={application.applied_at}
            emailVerified={emailVerified}
            chatGptConnected={chatGptConnected}
            onSaved={handleSaved}
            onPendingChange={setIsSaving}
          />
        ) : (
          <ApplicationDetailView application={application} />
        )}
      </div>
    </div>
  );
}
