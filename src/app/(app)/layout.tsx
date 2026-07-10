import { AppHeader } from "@/components/app-chrome";
import { SiteFooter } from "@/components/site-chrome";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4ECE3]">
      <AppHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
