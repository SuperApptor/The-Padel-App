import React from 'react';

export const PadelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#62b1f3', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8E85FF', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        
        {/* The two vertical stems */}
        <path d="M8 21v-6" />
        <path d="M11 21v-6" />

        {/* The 'P' head */}
        <path d="M11 15H14.5A3.5 3.5 0 0 0 18 11.5A3.5 3.5 0 0 0 14.5 8H11" />
        <path d="M18.5 18.5A7.5 7.5 0 1 0 11 4" />
    </svg>
);
