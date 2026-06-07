export const dynamic = 'force-dynamic';
import { AdminUsersComponent } from '@gitroom/frontend/components/admin/admin-users.component';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin · Users', description: '' };

export default function Page() {
  return <AdminUsersComponent />;
}
