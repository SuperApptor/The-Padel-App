import React from 'react';

export const PadelPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <g transform="rotate(-30 12 12)">
        <circle cx="12" cy="8" r="5.25" />
        <path strokeLinecap="round" d="M12 13v8" />
    </g>
    <g transform="rotate(30 12 12)">
        <circle cx="12" cy="8" r="5.25" />
        <path strokeLinecap="round" d="M12 13v8" />
    </g>
  </svg>
);