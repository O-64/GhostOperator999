'use client';

import React, { useState } from 'react';
import { PRICING_TIERS } from '../data/mockData';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface PricingProps {
  onOpenAuth: (mode: 'login' | 'signup', role?: 'candidate' | 'recruiter') => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenAuth }) => {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50/90 relative">
      
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Investment Plans
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Accelerate Your Talent Pipeline with <br />
            <span className="text-gold-gradient">Flexible Enterprise Pricing</span>
          </h2>
          <p className="text-base text-stone-600">
            Start with our 14-day risk-free trial. Upgrade or downgrade anytime with zero contractual friction.
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${!annualBilling ? 'text-stone-900' : 'text-stone-500'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-8 rounded-full bg-stone-900 p-1 transition-colors relative"
            >
              <div className={`w-6 h-6 rounded-full bg-amber-400 transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${annualBilling ? 'text-stone-900' : 'text-stone-500'}`}>
                Annual Billing
              </span>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                SAVE 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`glass-panel p-8 rounded-3xl flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 ${
                tier.popular
                  ? 'border-2 border-amber-400 shadow-2xl shadow-amber-500/20 bg-white/90 scale-105 z-10'
                  : 'border border-amber-200/80 shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  MOST POPULAR RECRUITER TIER
                </div>
              )}

              <div className="space-y-6">
                
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900">{tier.name}</h3>
                  <p className="text-xs text-stone-600 mt-1">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-stone-900 font-mono">
                    ${annualBilling ? tier.priceAnnual : tier.priceMonthly}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">/ month</span>
                  {annualBilling && (
                    <span className="text-[10px] text-amber-700 font-bold ml-2">Billed annually</span>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-amber-200/70">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">Included Capabilities</span>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-stone-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div className="pt-8">
                <button
                  onClick={() => onOpenAuth('signup', 'recruiter')}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 text-stone-950 shadow-md shadow-amber-500/25 hover:from-amber-600'
                      : 'bg-stone-950 text-amber-400 hover:bg-stone-900'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
