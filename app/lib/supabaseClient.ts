import { createClient } from "@supabase/supabase-js";

// Declare the Clerk types to fix the TypeScript error
declare global {
  interface Window {
    Clerk: {
      session?: {
        getToken: (options: { template: string }) => Promise<string>;
      };
    };
  }
}

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await window.Clerk.session?.getToken({
          template: "supabase",
        });

        const headers = new Headers(options?.headers);
        headers.set("Authorization", `Bearer ${clerkToken}`);

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  }
);

const createClerkSupabaseClient = () => client;

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );
}

export { createClerkSupabaseClient, createSupabaseClient };