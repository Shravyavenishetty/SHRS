'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate dashboard or login
    if (authUtils.isAuthenticated()) {
      const dashboard = authUtils.getDashboardRoute();
      router.push(dashboard);
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-primary text-xl">Loading...</div>
    </div>
  );
}
