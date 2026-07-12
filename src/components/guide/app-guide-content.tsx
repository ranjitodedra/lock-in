import Link from "next/link";

import { ChatGptLoginGuide } from "@/components/guide/chatgpt-login-guide";

export function AppGuideContent() {
  return (
    <div className="flex-1 space-y-6 overflow-auto">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">1. Get started</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Sign in with your email or Google account from the login page.
          </li>
          <li>
            If your email is not verified, use the banner at the top of the app
            to resend the verification link before saving applications.
          </li>
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">2. Connect ChatGPT</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Click <span className="font-medium text-foreground">Settings</span> in
          the sidebar, then scroll to the ChatGPT connection section. Follow
          these steps:
        </p>
        <div className="mt-4">
          <ChatGptLoginGuide />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          After you approve access in ChatGPT, return here — Lock-In will
          connect automatically. You can also connect from{" "}
          <Link href="/applications/new" className="underline hover:text-foreground">
            New Application
          </Link>{" "}
          when adding your first job.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">3. Add an application</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Click{" "}
            <Link
              href="/applications/new"
              className="font-medium text-foreground underline hover:text-foreground"
            >
              New Application
            </Link>{" "}
            in the sidebar.
          </li>
          <li>Paste the full job description into the text area.</li>
          <li>
            Click <span className="font-medium text-foreground">Extract fields</span>{" "}
            to auto-fill company, role, skills, and other details (requires
            ChatGPT connection).
          </li>
          <li>Review and edit any fields, then click Save.</li>
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">4. Use the dashboard</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Open{" "}
            <Link
              href="/dashboard"
              className="font-medium text-foreground underline hover:text-foreground"
            >
              Dashboard
            </Link>{" "}
            in the sidebar to see all applications.
          </li>
          <li>
            Use the search bar to find applications by company, role, or skills.
          </li>
          <li>
            Filter by status or work mode using the dropdowns in the toolbar.
          </li>
          <li>
            Click a row to open full details. Update status directly from the
            table or detail view.
          </li>
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">5. Follow-ups</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When you set an application status to{" "}
          <span className="font-medium text-foreground">Applied</span>, Lock-In
          suggests a follow-up date 14 calendar days later. You can
          edit the date before or after saving.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium">6. AI extraction</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          AI extraction is free and unlimited in Lock-In. Connect your ChatGPT
          account in{" "}
          <Link
            href="/settings"
            className="font-medium text-foreground underline hover:text-foreground"
          >
            Settings
          </Link>{" "}
          to extract fields from job postings. Manual entry is always available
          without ChatGPT.
        </p>
      </section>
    </div>
  );
}
