import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageStub } from '../../components/ui/PageStub';

export const AdminLogin: React.FC = () => {
  useDocumentTitle('Admin Login');
  return (
    <PageStub
      title="Staff Login"
      description="Email and password login portal for Municipal Officers, Department Heads, and City Administrators."
      role="Auth"
      milestone="M3"
    />
  );
};
