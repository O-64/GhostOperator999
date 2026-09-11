"use client";

import React, { useEffect, useState } from "react";

interface ProfileRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  onClick?: () => void;
}

export default function ProfileRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  label = "Profile Complete",
  onClick,
}: ProfileRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  let colorClass = "text-amber-500";
  let strokeColor = "url(#amberGradient)";

  if (percentage < 40) {
    colorClass = "text-amber-500";
    strokeColor = "url(#amberGradient)";
  } else if (percentage < 80) {
    colorClass = "text-yellow-500";
    strokeColor = "url(#yellowGradient)";
  } else if (percentage < 100) {
    colorClass = "text-lime-500";
    strokeColor = "url(#limeGradient)";
  } else {
    colorClass = "text-emerald-500";
    strokeColor = "url(#emeraldGradient)";
  }

  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center transition-all duration-300 ${onClick ? 'cursor-pointer group hover:scale-105' : ''}`}
    >
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center"
      >
        <svg
          className="absolute transform -rotate-90 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] transition-all duration-300"
          width={size}
          height={size}
          style={{ filter: "drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.4))" }}
        >
          <defs>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#65a30d" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-stone-800/40"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>
            {animatedPercentage}%
          </span>
        </div>
      </div>
      
      {label && (
        <span className="mt-2 text-xs font-semibold text-stone-400 tracking-wide uppercase group-hover:text-amber-400 transition-colors">
          {label}
        </span>
      )}
    </div>
  );
}
