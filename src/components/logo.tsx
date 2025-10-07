import React from 'react';

const Logo = () => (
  <svg
    width="300"
    height="50"
    viewBox="0 0 300 50"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto"
  >
    <style>
      {`
        .logo-font {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
      `}
    </style>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="logo-font">
      <tspan fill="#FFFFFF">SYNC</tspan>
      <tspan fill="#14c99e" dx="0.2em">TECH</tspan>
      <tspan fill="#FFFFFF" dx="0.4em">GAME HUB</tspan>
    </text>
  </svg>
);

export default Logo;
