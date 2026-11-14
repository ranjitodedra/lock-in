import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { SupabaseBrowserProvider } from "@/components/auth/supabase-browser-provider";
import { clearBrowserSupabaseConfig } from "@/lib/supabase/browser-config";
import { createClient } from "@/lib/supabase/client";

describe("browser Supabase client via injected config", () => {
  afterEach(() => {
    clearBrowserSupabaseConfig();
  });

  it("provider supplies config for createClient call sites", () => {
    render(
      <SupabaseBrowserProvider
        url="https://injected.supabase.co"
        anonKey="injected-anon-key"
      >
        <span>child</span>
      </SupabaseBrowserProvider>,
    );

    const client = createClient() as unknown as {
      supabaseUrl: string;
      supabaseKey: string;
    };

    expect(client.supabaseUrl).toBe("https://injected.supabase.co");
    expect(client.supabaseKey).toBe("injected-anon-key");
  });
});
