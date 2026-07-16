import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const UserManagement: React.FC = () => {
  return (
    <PageStub
      title="User Management (CRUD)"
      description="Register new field officers, onboard supervisors, change roles, or audit current permissions profiles."
      role="Super Admin"
      milestone="M8"
    />
  );
};
