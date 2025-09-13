
import React from 'react';

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m16.636-4.636l-2.121 2.121M5.364 18.636l2.121-2.121m0-11.314l-2.121-2.121m13.435 13.435l-2.121-2.121" />
    </svg>
);