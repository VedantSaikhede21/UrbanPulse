import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const PublicMap: React.FC = () => {
  return (
    <PageStub
      title="Public Ward Health Map"
      description="View real-time active incident counts, resolved metrics, and cumulative Urban Health Scores (UHS) by ward across the municipality without logging in."
      role="Public"
      milestone="M8"
    />
  );
};
