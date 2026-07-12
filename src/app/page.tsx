import { LandingContent } from "@/components/landing/landing-content";
import { getAuthUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getAuthUser();
  const primaryHref = user ? "/dashboard" : "/login";
  const secondaryHref = user ? "/applications/new" : "/login?next=/applications/new";

  return (
    <LandingContent
      user={user}
      primaryHref={primaryHref}
      secondaryHref={secondaryHref}
    />
  );
}
