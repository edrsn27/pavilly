import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/shared/utils/supabase/server";
import { routes } from "@/navigation/routes";
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: storeId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.auth.login);

  const [{ data: ownedStore }, { count: memberCount }, { data: profile }] =
    await Promise.all([
      supabase
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .eq("owner_id", user.id)
        .maybeSingle(),
      supabase
        .from("store_members")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("user_id", user.id),
      supabase.from("users").select("role").eq("id", user.id).single(),
    ]);

  const isOwner = !!ownedStore;
  const isMember = (memberCount ?? 0) > 0;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isMember && !isAdmin) redirect(routes.dashboard);

  return <>{children}</>;
}
