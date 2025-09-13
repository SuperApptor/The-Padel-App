import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 00-9 9v.75h21v-.75a9 9 0 00-9-9zM4.5 9.75a4.5 4.5 0 014.5-4.5h6a4.5 4.5 0 014.5 4.5v3.75a.75.75 0 01-1.5 0V9.75a3 3 0 00-3-3h-6a3 3 0 00-3 3v3.75a.75.75 0 01-1.5 0V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V11.25m-3-3.75a3 3 0 116 0" />
  </svg>
);
