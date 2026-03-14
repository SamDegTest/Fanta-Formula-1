'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import CoppaDashboard from '../CoppaDashboard';

const CoppaDashboardPage = () => {
  const params = useParams();
  const router = useRouter();
  const coppaId = params.coppaId as string;

  const handleBack = () => {
    router.push('/coppa');
  };

  if (!coppaId) {
    // Should be handled by Next.js routing, but as a safeguard
    return null;
  }

  return <CoppaDashboard coppaId={coppaId} onBack={handleBack} />;
};

export default CoppaDashboardPage;
