import React from 'react';
import { PageStub } from '../../components/ui/PageStub';

export const About: React.FC = () => {
  return (
    <PageStub
      title="How UrbanPulse Works"
      description="Learn about our 9-agent LangGraph execution pipeline, real-time streaming, visual verification algorithms, and SLA prioritization heuristics."
      role="Public"
      milestone="M1"
    />
  );
};
