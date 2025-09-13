import React from 'react';

// Fix: Consolidated multiple icon declarations into a single export for `MaleIcon` to resolve redeclaration errors. The chosen icon is a standard Mars symbol.
// A standard Mars symbol for Male
export const MaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 4.5l-4.5 4.5m4.5-4.5v4.5m0-4.5h-4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
  </svg>
);
