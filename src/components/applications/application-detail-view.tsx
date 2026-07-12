import {
  buildDetailSections,
  formatPastedDescription,
} from "@/lib/applications/detail-fields";
import { FadeInView } from "@/components/motion/fade-in-view";
import { EMPTY_VALUE } from "@/lib/applications/format";
import type { ApplicationRow } from "@/types/application";

type ApplicationDetailViewProps = {
  application: ApplicationRow;
};

function FieldValue({
  value,
  multiline,
  href,
}: {
  value: string;
  multiline?: boolean;
  href?: string;
}) {
  const muted = value === EMPTY_VALUE;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        {value}
      </a>
    );
  }

  return (
    <p
      className={
        multiline
          ? `mt-0.5 text-sm whitespace-pre-wrap ${muted ? "text-muted-foreground" : ""}`
          : `mt-0.5 text-sm ${muted ? "text-muted-foreground" : ""}`
      }
    >
      {value}
    </p>
  );
}

export function ApplicationDetailView({
  application,
}: ApplicationDetailViewProps) {
  const sections = buildDetailSections(application);
  const pasted = formatPastedDescription(application.raw_description);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      {sections.map((section, i) => (
        <FadeInView key={section.title} delay={i * 0.06}>
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {section.title}
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {section.fields.map(({ label, value, multiline, href }) => (
                <div
                  key={label}
                  className={multiline ? "sm:col-span-2" : undefined}
                >
                  <dt className="text-xs font-medium text-muted-foreground">
                    {label}
                  </dt>
                  <dd>
                    <FieldValue
                      value={value}
                      multiline={multiline}
                      href={href}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </FadeInView>
      ))}

      <FadeInView delay={sections.length * 0.06}>
        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Original posting
          </h2>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p
              className={`text-sm whitespace-pre-wrap ${pasted === EMPTY_VALUE ? "text-muted-foreground" : ""}`}
            >
              {pasted}
            </p>
          </div>
        </section>
      </FadeInView>
    </div>
  );
}
