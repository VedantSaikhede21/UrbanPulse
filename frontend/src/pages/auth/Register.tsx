import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageStub } from '../../components/ui/PageStub';

export const Register: React.FC = () => {
  useDocumentTitle('Register');
  return (
    <PageStub
      title="Citizen Registration"
      description="Register your account with your name, phone number, and municipal ward location."
      role="Auth"
      milestone="M3"
    />
  );
};
