import { MembersStats } from "./MembersStats";
import { ShortcutLinks } from "./ShortcutLinks";
import { RecentMembers } from "./RecentMembers";

export function DashboardLayout() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization&lsquo;s attendance and activity
        </p>
      </div>

      <MembersStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShortcutLinks />
        <RecentMembers />
      </div>
    </div>
  );
}
