import React from 'react';

const AppIcon = () => (
  <svg 
    width="256" 
    height="256" 
    viewBox="0 0 256 256" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Define gradients */}
    <defs>
      {/* Background radial gradient */}
      <radialGradient id="bgGradient" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#FFF9F3"/>
        <stop offset="100%" stopColor="#FDECDC"/>
      </radialGradient>

      {/* Highlight linear gradient for the rabbit head */}
      <linearGradient id="headHighlight" x1="128" y1="128" x2="128" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </linearGradient>
    </defs>

    {/* Background circle */}
    <circle cx="128" cy="128" r="96" fill="url(#bgGradient)"/>

    {/* Rabbit silhouette */}
    {/* Ears: two elongated shapes */}
    <path
      d="M100,60 C100,30 120,20 128,20 C136,20 156,30 156,60 C156,90 136,90 128,90 C120,90 100,90 100,60Z"
      fill="#E67E22"
    />
    
    {/* Inner ears for detail: slightly lighter shade */}
    <path
      d="M114,54 C114,44 122,40 128,40 C134,40 142,44 142,54 C142,64 134,64 128,64 C122,64 114,64 114,54Z"
      fill="#F08C35"
    />

    {/* Head: a circle for the head of the rabbit */}
    <circle cx="128" cy="148" r="48" fill="#E67E22"/>

    {/* Nose: a small lighter dot */}
    <circle cx="128" cy="158" r="5" fill="#FDE3A7"/>

    {/* Subtle highlight on the head */}
    <path
      d="M128,100 C150,100 165,115 165,148 C165,175 150,190 128,190 C106,190 91,175 91,148 C91,115 106,100 128,100Z"
      fill="url(#headHighlight)"
    />

    {/* Optional subtle eyes, kept very minimal and soft */}
    <circle cx="116" cy="144" r="3" fill="#000" opacity="0.1"/>
    <circle cx="140" cy="144" r="3" fill="#000" opacity="0.1"/>
  </svg>
);

export default AppIcon; 