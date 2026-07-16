import React from 'react';
import { Card, CardContent } from './Card';

interface PageStubProps {
  title: string;
  description: string;
  role: 'Public' | 'Auth' | 'Citizen' | 'Officer' | 'Department Head' | 'Ward/City Admin' | 'Super Admin' | 'Shared';
  milestone: string;
}

export const PageStub: React.FC<PageStubProps> = ({
  title,
  description,
  role,
  milestone,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-lime">
            {role} Interface
          </span>
          <span className="text-gray-600 font-mono text-xs">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-gray-500">
            Milestone {milestone}
          </span>
        </div>
        <h1 className="text-4xl font-bold font-serif italic text-foreground mt-2">
          {title}
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl font-sans mt-2">
          {description}
        </p>
      </div>

      <Card className="border-dashed border-panel-border bg-panel-card/30 p-8">
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand-lime/20 flex items-center justify-center text-brand-lime font-mono text-sm mt-1">
              i
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground font-sans">
                Interface Scaffolded
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                This is a placeholder page for the sitemap. During Milestone {milestone}, this stub will be replaced with the full interactive experience.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-panel-border">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-mono font-bold mb-3">
              Role Access & Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-panel-bg p-4 rounded border border-panel-border">
                <span className="text-xs text-gray-400 font-mono">Current User Context</span>
                <p className="text-sm font-semibold text-foreground mt-1 font-sans capitalize">
                  {role}
                </p>
              </div>
              <div className="bg-panel-bg p-4 rounded border border-panel-border">
                <span className="text-xs text-gray-400 font-mono">Release Phase Target</span>
                <p className="text-sm font-semibold text-foreground mt-1 font-sans">
                  Milestone {milestone} Deployment
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
