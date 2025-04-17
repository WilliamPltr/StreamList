
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export interface Film {
  annee?: string;
  resume_en_cours?: boolean;
  resume_error?: string | null;
  resume_fail_count?: number;

  id: string;
  titre: string;
  image: string;
  note?: number;
  dateVue?: Date;
  resume?: string;
}

interface FilmCardProps {
  film: Film;
  isNew?: boolean;
}

const FilmCard: React.FC<FilmCardProps> = ({ film, isNew }) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <Link 
      to={`/film/${film.id}`} 
      className={`group relative overflow-hidden rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 ${isNew ? 'animate-new-film-card ring-2 ring-primary/70 shadow-xl' : ''}`}
      style={isNew ? { animation: 'new-film-card 1.5s cubic-bezier(0.4,0,0.2,1)' } : {}}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={film.image || 'https://via.placeholder.com/300x450?text=Pas+d%27image'} 
          alt={film.titre}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 brightness-100"
          loading="lazy"
        />
      </div>
      <div className={`absolute bottom-0 left-0 right-0 p-3 ${
        isLightMode 
          ? 'bg-gradient-to-t from-background/95 to-transparent text-black' 
          : 'bg-gradient-to-t from-background/95 to-transparent'
      }`}>
        {/* Affiche le titre du film en haut, puis résumé en dessous */}
        <h3 className="text-base font-medium line-clamp-1 text-white font-semibold drop-shadow-md" style={{textShadow: '0 2px 8px rgba(0,0,0,0.22)'}}>
          {film.titre}{film.annee ? ` (${film.annee})` : ''}
          {(film.resume_en_cours || !film.resume) && !film.resume_error && (
            <span className="ml-2 align-middle inline-block animate-spin"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#aaa" strokeWidth="4" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="#aaa" strokeWidth="4" strokeLinecap="round"/></svg></span>
          )}
          {film.resume_error && (
            <span className="ml-2 align-middle inline-flex items-center text-red-500" title={film.resume_error}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f00" strokeWidth="4" opacity="0.3"/><path d="M8 8l8 8M16 8l-8 8" stroke="#f00" strokeWidth="2" strokeLinecap="round"/></svg>
              <button
                className="ml-1 px-2 py-0.5 rounded bg-red-100 text-xs hover:bg-red-200"
                onClick={async (e) => {
                  e.preventDefault();
                  // Relance la génération IA côté backend (ici: reset erreur et relance)
                  if(window.confirm('Relancer la génération IA pour ce film ?')){
                    // @ts-ignore
                    const { supabase } = await import('@/integrations/supabase/client');
                    await supabase.from('films').update({ resume_en_cours: true, resume_error: null }).eq('id', film.id);
                    window.location.reload();
                  }
                }}
              >Relancer</button>
            </span>
          )}
        </h3>
        {/* Pas de résumé sur la page d'accueil */}
        {window.location.pathname !== '/' && (
          <div className="text-sm text-white font-normal drop-shadow-md mb-1 line-clamp-5" style={{textShadow: '0 2px 8px rgba(0,0,0,0.22)'}}>
            {film.resume && !film.resume_en_cours && !film.resume_error && (
              <ReactMarkdown>{film.resume}</ReactMarkdown>
            )}
          </div>
        )}

        <div className="flex flex-row items-center gap-2">
          {film.note !== undefined && (
            <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-sm mt-1 flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" fill="currentColor" />
              <span className={`text-xs ${isLightMode ? 'text-black/70' : 'text-muted-foreground'}`}>Note : {film.note}/5</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Animation CSS pour l'apparition du nouveau film
// À ajouter dans le CSS global :
// @keyframes new-film-card {
//   0% { opacity: 0; transform: translateY(30px) scale(0.95); box-shadow: none; }
//   60% { opacity: 1; transform: translateY(-6px) scale(1.03); box-shadow: 0 0 0 6px var(--primary); }
//   100% { opacity: 1; transform: none; box-shadow: none; }
// }

export default FilmCard;
