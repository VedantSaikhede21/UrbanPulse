import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const Login: React.FC = () => {
  return (
    <PageStub
      title="Citizen Login"
      description="Enter your phone number to receive a one-time password (OTP) and login securely to start reporting issues."
      role="Auth"
      milestone="M3"
    />
  );
};
