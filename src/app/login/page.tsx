import { LoginBrand, LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/auth/routes";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const errorCode = params.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <LoginBrand />
      <LoginForm nextPath={nextPath} errorCode={errorCode} />
    </div>
  );
}
