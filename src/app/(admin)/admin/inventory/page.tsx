'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminInventoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/products');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-slate-500">
      Redirecting to Products...
    </div>
  );
}
