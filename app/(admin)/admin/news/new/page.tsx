'use client';

import { AdminNewsForm } from '@/components/admin/AdminNewsForm';

export default function AdminNewsNewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        បន្ថែមអត្ថបទ
      </h1>
      <AdminNewsForm />
    </div>
  );
}
