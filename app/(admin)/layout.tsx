import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin | CamboEA',
  description: 'CamboEA admin panel',
};

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
