import React from 'react';

export default function AIResponse({ data }) {
  if (!data) return <p className="text-blue-200/70 text-sm italic">Tap the spark button to analyze your spending habits.</p>;

  // Helper to make text **bold**
  const parseBold = (text) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="text-cyan-200 font-bold">{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-3 text-sm text-blue-100 leading-relaxed">
      {data.split('\n').map((line, index) => {
        const trimmed = line.trim();
        
        // 1. Headlines (## Title)
        if (trimmed.startsWith('##')) {
          return <h3 key={index} className="text-lg font-bold text-white mt-4 border-b border-white/10 pb-1">{parseBold(trimmed.replace(/#/g, '').trim())}</h3>;
        }
        
        // 2. Bullet Points (* Item)
        if (trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-2 ml-1">
              <span className="text-cyan-400 mt-1.5 text-[8px]">•</span>
              <span>{parseBold(trimmed.replace('* ', ''))}</span>
            </div>
          );
        }

        // 3. Horizontal Rule (---)
        if (trimmed.startsWith('---')) {
          return <hr key={index} className="border-white/10 my-2" />;
        }

        // 4. Empty Lines (Spacing)
        if (trimmed === '') {
          return <div key={index} className="h-1"></div>;
        }

        // 5. Standard Text
        return <p key={index}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
}