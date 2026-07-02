import { AuthHeader } from "@/components/app-chrome";
import { SiteFooter } from "@/components/site-chrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbf6ee]">
      <AuthHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
