import React from 'react';
import { UploadCloud, ShieldCheck, History, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'maker', label: 'Maker (Upload)', icon: UploadCloud },
    { id: 'checker', label: 'Checker (Batches)', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-neutral-900 text-white">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900">
              Transaction Validator
            </h1>
            <p className="text-xs text-neutral-500">Maker-Checker Portal</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/80 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
