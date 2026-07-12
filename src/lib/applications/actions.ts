"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  type ApplicationFormValues,
  formValuesToInsert,
  formValuesToUpdate,
  validateFormValues,
} from "@/lib/applications/form";
import { resolveAppliedFields } from "@/lib/applications/follow-up";
import {
  listApplicationsPage,
  type ListApplicationsPageResult,
} from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRow, ApplicationStatus } from "@/types/application";

export type ActionResult = { error: string } | { success: true };

export type UpdateApplicationResult =
  | { error: string }
  | { success: true; application: ApplicationRow };

export type UpdateApplicationOptions = {
  shouldRedirect?: boolean;
};

export type PatchApplicationInput = {
  status?: ApplicationStatus;
  follow_up_date?: string | null;
};

export type PatchApplicationResult =
  | { error: string }
  | { success: true; application: ApplicationRow };

async function assertCanSave(): Promise<ActionResult | null> {
  const user = await requireUser();
  if (!user.email_confirmed_at) {
    return {
      error: "Verify your email before saving applications.",
    };
  }
  return null;
}

function prepareForSave(
  values: ApplicationFormValues,
  existingAppliedAt: string | null,
  previousStatus?: ApplicationStatus | null,
): { values: ApplicationFormValues; applied_at: string | null } {
  const resolved = resolveAppliedFields(
    values.status,
    existingAppliedAt,
    values.follow_up_date,
    previousStatus,
  );
  return {
    values: { ...values, follow_up_date: resolved.follow_up_date },
    applied_at: resolved.applied_at,
  };
}

export async function createApplication(
  values: ApplicationFormValues,
): Promise<ActionResult> {
  const saveBlock = await assertCanSave();
  if (saveBlock) return saveBlock;

  const validationError = validateFormValues(values);
  if (validationError) {
    return { error: validationError };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const prepared = prepareForSave(values, null, null);
  const { error } = await supabase
    .from("applications")
    .insert(
      formValuesToInsert(prepared.values, user.id, prepared.applied_at),
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateApplication(
  id: string,
  values: ApplicationFormValues,
  options: UpdateApplicationOptions = {},
): Promise<UpdateApplicationResult> {
  const shouldRedirect = options.shouldRedirect ?? true;
  const saveBlock = await assertCanSave();
  if (saveBlock && "error" in saveBlock) return saveBlock;

  const validationError = validateFormValues(values);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("applications")
    .select("status, applied_at")
    .eq("id", id)
    .single();

  const prepared = prepareForSave(
    values,
    existing?.applied_at ?? null,
    (existing?.status as ApplicationStatus) ?? null,
  );
  const { data: updated, error } = await supabase
    .from("applications")
    .update(formValuesToUpdate(prepared.values, prepared.applied_at))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${id}`);

  if (!shouldRedirect) {
    return { success: true, application: updated as ApplicationRow };
  }

  redirect("/dashboard");
  return { error: "Redirect failed." };
}

export async function patchApplication(
  id: string,
  patch: PatchApplicationInput,
): Promise<PatchApplicationResult> {
  const saveBlock = await assertCanSave();
  if (saveBlock && "error" in saveBlock) return { error: saveBlock.error };

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? "Application not found." };
  }

  const updatePayload: {
    status?: ApplicationStatus;
    applied_at?: string | null;
    follow_up_date?: string | null;
  } = {};

  if (patch.status !== undefined) {
    const resolved = resolveAppliedFields(
      patch.status,
      existing.applied_at,
      patch.follow_up_date !== undefined
        ? (patch.follow_up_date ?? "")
        : (existing.follow_up_date ?? ""),
      existing.status as ApplicationStatus,
    );
    updatePayload.status = patch.status;
    updatePayload.applied_at = resolved.applied_at;
    updatePayload.follow_up_date = resolved.follow_up_date || null;
  } else if (patch.follow_up_date !== undefined) {
    updatePayload.follow_up_date = patch.follow_up_date?.trim() || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    return { success: true, application: existing as ApplicationRow };
  }

  const { data: updated, error } = await supabase
    .from("applications")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, application: updated as ApplicationRow };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function loadApplicationsPage(
  cursor?: string,
): Promise<ListApplicationsPageResult> {
  await requireUser();
  return listApplicationsPage({ cursor });
}
