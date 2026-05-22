import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/middleware";
import { routes } from "@/navigation/routes";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/login", "/signup"],
};
