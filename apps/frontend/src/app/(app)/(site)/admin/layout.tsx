import { AdminLayout } from '@gitroom/frontend/components/admin/admin-layout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
