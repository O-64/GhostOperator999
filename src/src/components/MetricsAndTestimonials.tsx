'use client';

import React from 'react';
import { TESTIMONIALS } from '../data/mockData';
import { Star, Quote } from 'lucide-react';

const metrics = [
  { value: '10x', label: 'Faster Time-to-Hire', sub: 'From weeks to days' },
  { value: '85%', label: 'Screening Time Saved', sub: 'Fully automated first-pass' },
  { value: '98%', label: 'AI Match Accuracy', sub: 'Skill-based verified matching' },
  { value: '100%', label: 'Verified Profiles', sub: 'Fraud & authenticity checked' },
];

export const MetricsAndTestimonials: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-900 text-stone-100 relative overflow-hidden">

      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m, i) => (
            <div key={i} className="p-6 rounded-3xl bg-stone-800/80 border border-stone-700 space-y-2">
              <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">{m.value}</p>
              <p className="text-xs font-bold text-stone-300">{m.label}</p>
              <p className="text-[10px] text-stone-500">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trusted by Candidates & Recruiters Alike
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-stone-800/60 p-6 rounded-3xl border border-stone-700/80 flex flex-col justify-between space-y-4">
                <Quote className="w-8 h-8 text-amber-500/40" />
                <p className="text-xs text-stone-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-stone-700/60">
                  <img src={t.avatar} className="w-10 h-10 rounded-full object-cover border border-amber-500/50" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.author}</h4>
                    <p className="text-[10px] text-amber-400">{t.role} • {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
