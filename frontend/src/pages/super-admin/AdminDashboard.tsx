import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const AdminDashboard: React.FC = () => {
  return (
    <PageStub
      title="Super Admin Panel"
      description="Manage overall configuration, coordinate routing parameters, check audit details, and track system status."
      role="Super Admin"
      milestone="M8"
    />
  );
};
