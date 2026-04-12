import React from 'react'

export const HandDrawnIcon = ({ name, size = 24, className = "" }) => {
  const icons = {
    wave: (
      <path
        d="M7 13C7 13 8 11.5 10 11.5C12 11.5 13 13.5 15 13.5C17 13.5 18 12 18 12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    food: (
      <path
        d="M18 8H6C4.89543 8 4 8.89543 4 10V11C4 14.866 7.13401 18 11 18H13C16.866 18 20 14.866 20 11V10C20 8.89543 19.1046 8 18 8ZM18 8V6C18 4.89543 17.1046 4 16 4H8C6.89543 4 6 4.89543 6 6V8M8 12V14M12 12V14M16 12V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    coffee: (
      <path
        d="M6 10H15C16.6569 10 18 11.3431 18 13C18 14.6569 16.6569 16 15 16H6C4.34315 16 3 14.6569 3 13V12C3 10.8954 3.89543 10 5 10ZM18 13H19C20.1046 13 21 13.8954 21 15C21 16.1046 20.1046 17 19 17H18M7 7V9M10 7V9M13 7V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    shopping: (
      <path
        d="M6 8L5 20H19L18 8M6 8H18M6 8L7 6C7.5 4 8.5 4 12 4C15.5 4 16.5 4 17 6L18 8M10 12V14M14 12V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    travel: (
      <path
        d="M4 14L5 11M5 11L7 6H17L19 11M5 11H19M19 11L20 14M20 14V18H18M20 14H4M4 14V18H6M6 18H18M6 18V20H8V18M16 18V20H18V18M8 14H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    leisure: (
      <path
        d="M12 20V12M12 12C12 12 13 9 17 9M12 12C12 12 11 9 7 9M12 12C12 12 14 10 15 6M12 12C12 12 10 10 9 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    tech: (
      <path
        d="M4 6H20V15H4V6ZM2 17H22V18H2V17ZM10 15V17M14 15V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    receipt: (
      <path
        d="M6 4V20L8 18L10 20L12 18L14 20L16 18L18 20V4H6ZM9 8H15M9 12H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    star: (
      <path
        d="M12 3L14.5 9L21 10L16 15L17.5 21L12 18L6.5 21L8 15L3 10L9.5 9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }

  const icon = icons[name] || icons.star

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} pencil-icon`}
      style={{ filter: 'url(#pencil-texture)' }}
    >
      {icon}
    </svg>
  )
}

// Add this to your root layout to provide the filter
export const PencilTextureFilter = () => (
  <svg width="0" height="0" className="absolute invisible">
    <filter id="pencil-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
)
