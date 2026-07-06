import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { navigationGroups } from "@/config/navigation";
import { routes } from "@/config/routes";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { authKeys } from "@/features/auth/queries/auth.queries";
import { filterNavigationByPermissions } from "@/lib/auth/permissions";
import { getServerQueryClient } from "@/lib/query-server";
import { RealtimeProvider } from "@/features/realtime/components/realtime-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${routes.login}?reauth=1`);
  }

  const visibleGroups = filterNavigationByPermissions(user, navigationGroups);
  const queryClient = getServerQueryClient();

  queryClient.setQueryData(authKeys.currentUser(), user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RealtimeProvider>
      <main className="min-h-screen overflow-x-clip bg-background text-foreground">
        <div className="flex min-h-screen min-w-0">
          <AppSidebar groups={visibleGroups} />

          <section className="flex min-w-0 flex-1 flex-col">
            <AppTopbar />

            <div className="min-w-0 flex-1 px-4 py-5 lg:px-6 lg:py-6">
              {children}
            </div>
          </section>
        </div>
      </main>
      </RealtimeProvider>
    </HydrationBoundary>
  );
}
