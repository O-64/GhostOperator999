"use client";

import React, { useEffect, useState } from "react";

interface SkillBarChartProps {
  skillLevels: { skill: string; level: number }[];
}

export default function SkillBarChart({ skillLevels }: SkillBarChartProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getColorClasses = (level: number) => {
    if (level < 40) return "from-stone-400 to-amber-400";
    if (level < 70) return "from-amber-400 to-yellow-400";
    if (level < 90) return "from-yellow-400 to-lime-400";
    return "from-lime-400 to-emerald-500";
  };

  const getDotColorClass = (level: number) => {
    if (level < 40) return "bg-amber-400";
    if (level < 70) return "bg-yellow-400";
    if (level < 90) return "bg-lime-400";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-5">
      {skillLevels.map((item, index) => (
        <div key={item.skill} className="flex items-center text-sm">
          {/* Label side */}
          <div className="w-1/3 flex items-center space-x-3 pr-4">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDotColorClass(item.level)}`} />
            <span className="font-medium text-stone-700 truncate" title={item.skill}>
              {item.skill}
            </span>
          </div>
          
          {/* Bar side */}
          <div className="w-2/3 flex items-center space-x-3">
            <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${getColorClasses(item.level)}`}
                style={{ 
                  width: animate ? `${item.level}%` : "0%",
                  transitionDelay: `${index * 150}ms`
                }}
              />
            </div>
            <div className="w-10 text-right font-mono text-stone-500 font-medium">
              {animate ? item.level : 0}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
