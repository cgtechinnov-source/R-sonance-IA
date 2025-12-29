import React from 'react';

interface TopicDisplayProps {
  content: string;
  className?: string;
}

export const TopicDisplay: React.FC<TopicDisplayProps> = ({ content, className }) => {
  // Parsing simple pour diviser par lignes
  const sections = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, idx) => {
        // Nettoyage agressif des symboles Markdown
        // Enlève les **, les *, les ## et #
        const cleanText = section
            .replace(/\*\*/g, '')      // Enlève le gras
            .replace(/^#+\s*/, '')     // Enlève les titres (début de ligne)
            .replace(/^\*\s*/, '')     // Enlève les puces de liste
            .replace(/\*/g, '')        // Enlève les étoiles restantes
            .trim();

        // Détection simple pour le style : si la ligne originale commençait par # ou un chiffre, c'est probablement un titre/sous-titre
        const isHeader = section.trim().startsWith('#') || /^\d+\./.test(section.trim()) || section.trim().startsWith('**');
        
        if (isHeader) {
           return <h3 key={idx} className="font-semibold text-lg md:text-xl leading-relaxed">{cleanText}</h3>;
        }
        return <p key={idx} className="text-base md:text-lg leading-relaxed opacity-90">{cleanText}</p>;
      })}
    </div>
  );
};