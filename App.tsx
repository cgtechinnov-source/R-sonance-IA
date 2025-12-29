import React, { useState, useCallback } from 'react';
import { CATEGORIES } from './constants';
import { CategoryConfig, GeneratedTopic } from './types';
import { generateTopic } from './services/geminiService';
import { Icon } from './components/Icon';
import { TopicDisplay } from './components/TopicDisplay';
import { ChatInterface } from './components/ChatInterface';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<GeneratedTopic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCategorySelect = (category: CategoryConfig) => {
    setActiveCategory(category);
    setCurrentTopic(null);
    setError(null);
    setIsChatOpen(false);
  };

  const handleBack = () => {
    if (isChatOpen) {
        setIsChatOpen(false);
        return;
    }
    setActiveCategory(null);
    setCurrentTopic(null);
    setError(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!activeCategory) return;

    setIsLoading(true);
    setError(null);
    setCurrentTopic(null);
    setIsChatOpen(false);

    try {
      const response = await generateTopic(activeCategory.id, activeCategory.promptTopic);
      
      setCurrentTopic({
        id: Date.now().toString(),
        categoryId: activeCategory.id,
        content: response.text,
        groundingSources: response.sources,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  const copyToClipboard = async () => {
      if (currentTopic) {
        try {
            await navigator.clipboard.writeText(currentTopic.content);
            alert("Sujet copié dans le presse-papier !");
        } catch (err) {
            console.error("Failed to copy", err);
        }
      }
  };

  // --- Render Functions ---

  const renderWelcome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-white z-0" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center space-y-8 max-w-lg mx-auto animate-fade-in-up">
         {/* Logo Container */}
         <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] mb-4 ring-1 ring-slate-100 transform hover:scale-105 transition-transform duration-500">
             <Icon name="sparkles" className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" />
         </div>

         <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
              Résonance
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-light tracking-wide">
              Élevez vos conversations.
            </p>
         </div>

         <button 
           onClick={() => setShowWelcome(false)}
           className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
         >
            <span>Commencer l'expérience</span>
            <Icon name="arrow-left" className="w-5 h-5 ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
         </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
         <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">
            by Gloire Pambou
         </p>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen px-4 py-8 md:py-16 max-w-7xl mx-auto flex flex-col">
      <header className="text-center mb-10 md:mb-16 space-y-4 md:space-y-6 flex-grow-0">
        
        {/* En-tête Résonance amélioré : Brillant & Arrondi */}
        <div className="inline-flex items-center justify-center px-5 py-2.5 bg-white rounded-full shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-50 mb-2 hover:shadow-[0_4px_25px_rgba(99,102,241,0.25)] transition-all duration-300 cursor-default">
            <div className="bg-indigo-100/50 p-1.5 rounded-full mr-2.5">
               <Icon name="sparkles" className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-bold text-base md:text-lg text-slate-800 tracking-tight">Résonance</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          L'art de la conversation <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
            réinventé par l'IA
          </span>
        </h1>
        <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto px-4 font-medium opacity-80">
          Explorez l'imprévu, le complexe et le fascinant.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto pb-10 flex-grow">
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat)}
            className={`group relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-8 text-left transition-all duration-300 hover:shadow-xl border-2 hover:-translate-y-1 ${cat.colors.bg} ${cat.colors.border} hover:border-transparent ${cat.id === 'random' ? 'md:col-span-2 lg:col-span-1' : ''}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.colors.gradientFrom} ${cat.colors.gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10 flex flex-row md:flex-col items-center md:items-start h-full justify-between gap-3 md:gap-0">
                <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl mb-0 md:mb-4 ${cat.colors.text} bg-white/60 shadow-sm backdrop-blur-sm mr-3 md:mr-0 float-left md:float-none ring-1 ring-white/50`}>
                        <Icon name={cat.iconName} className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                    <div className="overflow-hidden">
                        <h2 className={`text-base md:text-2xl font-bold mb-0.5 ${cat.colors.text}`}>
                            {cat.label}
                        </h2>
                        <p className={`text-xs md:text-base opacity-80 font-medium ${cat.colors.text} line-clamp-2 md:line-clamp-none`}>
                            {cat.description}
                        </p>
                    </div>
                </div>
                <div className={`hidden md:block mt-4 transform transition-transform duration-300 group-hover:translate-x-1 ${cat.colors.text} self-end opacity-80 group-hover:opacity-100`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-8 text-center pb-6 opacity-60">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">by Gloire Pambou</p>
      </footer>
    </div>
  );

  const renderActiveCategory = () => {
    if (!activeCategory) return null;

    return (
      <div className={`min-h-screen transition-colors duration-500 ${activeCategory.colors.bg}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-12 min-h-screen flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-12 shrink-0">
            <button 
              onClick={handleBack}
              className={`flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors backdrop-blur-sm ${activeCategory.colors.text}`}
            >
              <Icon name="arrow-left" className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-xs md:text-base">
                  {isChatOpen ? 'Quitter' : 'Retour'}
              </span>
            </button>
            <div className={`flex items-center space-x-2 ${activeCategory.colors.text}`}>
               <Icon name={activeCategory.iconName} className="w-5 h-5 md:w-6 md:h-6 opacity-75" />
               <span className="font-bold text-sm md:text-lg tracking-tight truncate max-w-[150px] md:max-w-none">{activeCategory.label}</span>
            </div>
          </div>

          {/* CHAT VIEW - Optimized for Mobile height */}
          {isChatOpen && currentTopic ? (
             <div className="flex-grow animate-fade-in-up h-full max-h-[85vh] md:max-h-[75vh] flex flex-col">
                <ChatInterface 
                    topicContent={currentTopic.content} 
                    category={activeCategory} 
                    onClose={() => setIsChatOpen(false)} 
                />
             </div>
          ) : (
          /* GENERATION VIEW */
          <div className="flex-grow flex flex-col items-center justify-center pb-10">
            
            {/* Start Prompt */}
            {!currentTopic && !isLoading && (
              <div className="text-center space-y-5 md:space-y-8 animate-fade-in-up px-4">
                 <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg mb-3 md:mb-6 ring-4 ring-white/30">
                    <Icon name={activeCategory.iconName} className={`w-8 h-8 md:w-12 md:h-12 ${activeCategory.colors.accent}`} />
                 </div>
                 <h2 className={`text-xl md:text-5xl font-bold ${activeCategory.colors.text} max-w-2xl mx-auto leading-tight`}>
                    {activeCategory.id === 'random' 
                        ? "Laissez le hasard vous surprendre" 
                        : "Prêt à explorer un nouveau sujet ?"}
                 </h2>
                 <p className={`text-sm md:text-lg opacity-80 max-w-lg mx-auto ${activeCategory.colors.text}`}>
                    L'IA va générer un contexte unique et des questions pour stimuler votre échange.
                 </p>
                 <button
                    onClick={handleGenerate}
                    className={`mt-6 px-6 py-3 md:px-8 md:py-4 rounded-full text-white font-bold text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${activeCategory.colors.button} ${activeCategory.colors.buttonHover}`}
                  >
                    {activeCategory.id === 'random' ? "Surprenez-moi" : "Générer un sujet"}
                  </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
               <div className="text-center space-y-6 animate-pulse px-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto ${activeCategory.colors.text} border-current opacity-60`}></div>
                  <h3 className={`text-lg md:text-2xl font-semibold ${activeCategory.colors.text}`}>
                    {activeCategory.id === 'history' ? "Recherche de faits historiques..." : "Création d'un sujet unique..."}
                  </h3>
               </div>
            )}

            {/* Result Card */}
            {currentTopic && !isLoading && (
              <div className="w-full max-w-2xl animate-fade-in-up">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-5 md:p-12 relative overflow-hidden ring-1 ring-black/5">
                   {/* Decorative gradient blob */}
                   <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${activeCategory.colors.gradientFrom} ${activeCategory.colors.gradientTo}`} />

                   <TopicDisplay content={currentTopic.content} className="text-slate-800 relative z-10" />

                   {/* Grounding Sources (Search Results) */}
                   {currentTopic.groundingSources && currentTopic.groundingSources.length > 0 && (
                     <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
                       <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Sources Vérifiées</h4>
                       <div className="flex flex-wrap gap-2">
                         {currentTopic.groundingSources.map((source, idx) => (
                           <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full transition-colors truncate max-w-xs"
                           >
                             {source.title || source.uri}
                           </a>
                         ))}
                       </div>
                     </div>
                   )}
                </div>

                {/* Actions Bar */}
                <div className="mt-5 md:mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4">
                  <button
                    onClick={handleGenerate}
                    className={`w-full md:w-auto px-6 py-3 rounded-full text-white font-semibold text-sm md:text-base shadow-md hover:shadow-lg transition-all ${activeCategory.colors.button} ${activeCategory.colors.buttonHover}`}
                  >
                    Nouveau sujet
                  </button>
                  
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className={`w-full md:w-auto px-6 py-3 rounded-full bg-white font-semibold text-sm md:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 ${activeCategory.colors.text} border border-transparent hover:border-current`}
                  >
                     <Icon name="chat" className="w-5 h-5" />
                     <span>Débattre avec l'IA</span>
                  </button>

                   <button
                    onClick={copyToClipboard}
                    className={`w-full md:w-auto px-6 py-3 rounded-full bg-white font-semibold text-sm md:text-base shadow-sm hover:shadow-md transition-all ${activeCategory.colors.text}`}
                  >
                    Copier
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}

          </div>
          )}
        </div>
      </div>
    );
  };

  if (showWelcome) {
    return (
        <>
            <style>{`
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          {renderWelcome()}
        </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
      {activeCategory ? renderActiveCategory() : renderHome()}
    </>
  );
};

export default App;