import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const DepartmentDashboard: React.FC = () => {
  return (
    <PageStub
      title="Department Kanban Board"
      description="Manage ticket lifecycles, route issues manually when needed, override AI priority settings, and monitor field officer queues."
      role="Department Head"
      milestone="M8"
    />
  );
};
