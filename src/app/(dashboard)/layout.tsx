import { redirect } from "next/navigation";

import { FirstRunGuideOverlay } from "@/components/guide/first-run-guide-overlay";
import { requireUser } from "@/lib/auth/session";
import { StoreProvider } from "@/store/StoreProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <StoreProvider>
      <FirstRunGuideOverlay />
      {children}
    </StoreProvider>
  );
}
