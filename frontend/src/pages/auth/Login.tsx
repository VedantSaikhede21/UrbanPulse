import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageStub } from '../../components/ui/PageStub';

export const Login: React.FC = () => {
  useDocumentTitle('Login');
  return (
    <PageStub
      title="Citizen Login"
      description="Enter your phone number to receive a one-time password (OTP) and login securely to start reporting issues."
      role="Auth"
      milestone="M3"
    />
  );
};
