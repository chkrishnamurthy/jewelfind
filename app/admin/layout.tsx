import { AdminShell } from "@/src/components/layouts/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
