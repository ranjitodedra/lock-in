import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";

function loadLegalMarkdown(filename: string) {
  const path = join(process.cwd(), "docs", "legal", filename);
  return readFileSync(path, "utf-8");
}

function renderMarkdown(content: string) {
  return content.split("\n\n").map((block, index) => {
    if (block.startsWith("# ")) {
      return (
        <h1 key={index} className="text-3xl font-semibold tracking-tight">
          {block.replace("# ", "")}
        </h1>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 text-lg font-semibold">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("|")) {
      return (
        <pre
          key={index}
          className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs"
        >
          {block}
        </pre>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((line) => line.replace(/^- /, ""));
      return (
        <ul key={index} className="mt-4 list-disc space-y-2 pl-6 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className="mt-4 text-sm leading-7 text-muted-foreground">
        {block}
      </p>
    );
  });
}

export default function TermsPage() {
  const content = loadLegalMarkdown("TERMS_OF_SERVICE.md");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Lock-In
        </Link>
        <article className="mt-8">{renderMarkdown(content)}</article>
      </div>
    </div>
  );
}
