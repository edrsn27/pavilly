import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/shared/utils/supabase/server";
import { AppShell } from "@/widgets/AppShell";
import { routes } from "@/navigation/routes";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.auth.login);

  return <AppShell>{children}</AppShell>;
}
