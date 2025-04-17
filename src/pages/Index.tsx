import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FilmCard, { Film } from '@/components/FilmCard';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { citationsOSS117 } from '@/utils/citationsOSS117';

// Films de démonstration pour les utilisateurs non connectés
const filmsDemo: Film[] = [
  {
    id: '1',
    titre: 'Inception',
    image: 'https://images.unsplash.com/photo-1597575732103-9f6d96cfc932?q=80&w=2342&auto=format&fit=crop',
    note: 4.5,
    dateVue: new Date('2023-06-15'),
    resume: "Un voleur qui s'infiltre dans les rêves des autres..."
  },
  {
    id: '2',
    titre: 'Interstellar',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2594&auto=format&fit=crop',
    note: 5,
    dateVue: new Date('2023-05-20'),
    resume: "Un groupe d'explorateurs qui voyagent à travers un trou de ver..."
  },
  {
    id: '3',
    titre: 'Blade Runner 2049',
    image: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2670&auto=format&fit=crop',
    note: 4,
    dateVue: new Date('2023-04-10'),
    resume: "Un blade runner découvre un secret..."
  },
  {
    id: '4',
    titre: 'Dune',
    image: 'https://images.unsplash.com/photo-1630841539293-bd20634c5d72?q=80&w=2574&auto=format&fit=crop',
    note: 4.5,
    dateVue: new Date('2023-03-05'),
    resume: "L'histoire de Paul Atreides, un jeune homme..."
  },
  {
    id: '5',
    titre: 'The Matrix',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop',
    note: 5,
    dateVue: new Date('2023-02-20'),
    resume: "Un hacker découvre la vérité sur la réalité..."
  },
  {
    id: '6',
    titre: 'Arrival',
    image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=2535&auto=format&fit=crop',
    note: 4.5,
    dateVue: new Date('2023-01-15'),
    resume: "Une linguiste est recrutée par l'armée..."
  }
];

const Index = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAddedFilmId, setLastAddedFilmId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Fonction pour charger les films
  const loadFilms = async () => {
    setLoading(true);
    
    try {
      if (user) {
        // Charger les films depuis Supabase pour l'utilisateur connecté
        const { data, error } = await supabase
          .from('films')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Convertir les dates de string en objet Date
          const filmsWithDates = data.map((film: any) => ({
            ...film,
            dateVue: film.dateVue ? new Date(film.dateVue) : undefined
          }));
          
          setFilms(filmsWithDates);
          setFilteredFilms(filmsWithDates);
        } else {
          // Aucun film trouvé pour l'utilisateur
          setFilms([]);
          setFilteredFilms([]);
        }
      } else {
        // Utilisateur non connecté, afficher les films de démo
        setFilms(filmsDemo);
        setFilteredFilms(filmsDemo);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error);
      toast.error("Impossible de charger la liste des films");
    } finally {
      setLoading(false);
    }
  };

  // Charger les films au chargement de la page et quand l'utilisateur change
  useEffect(() => {
    loadFilms();
    // Récupère l'id du dernier film ajouté depuis le localStorage
    const lastId = localStorage.getItem('lastAddedFilmId');
    if (lastId) setLastAddedFilmId(lastId);
  }, [user]);

  // Polling robuste : démarre au mount, s'arrête si plus de film en cours
  useEffect(() => {
    let polling = true;
    let interval: NodeJS.Timeout | null = null;
    const poll = async () => {
      await loadFilms();
      if (polling && films.some(film => film.resume_en_cours)) {
        interval = setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      polling = false;
      if (interval) clearTimeout(interval);
    };
  }, [user]);

  // Fonction de recherche
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredFilms(films);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = films.filter(film => 
      film.titre.toLowerCase().includes(term) || 
      (film.resume && film.resume.toLowerCase().includes(term))
    );
    
    setFilteredFilms(filtered);
  };


  // Citation OSS117 aléatoire pour la page non connectée
  const citation = citationsOSS117[Math.floor(Math.random() * citationsOSS117.length)];

  // ...

  if (!user) {
    const bgMain = theme === 'dark' ? 'bg-black/95 text-white' : 'bg-gray-50 text-gray-900';
    const bgCard = theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/80';
    const blockquoteBorder = theme === 'dark' ? 'border-primary' : 'border-primary';
    const blockquoteText = theme === 'dark' ? 'text-zinc-300' : 'text-muted-foreground';
    return (
      <div className={`min-h-screen flex flex-col ${bgMain}`}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className={`${bgCard} rounded-3xl shadow-lg p-8 flex flex-col items-center max-w-lg w-full`}>
            <span className="text-6xl mb-6">🎬</span>
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">Connecte-toi pour commencer à ajouter des films !</h1>
            <blockquote className={`italic text-center ${blockquoteText} mb-6 border-l-4 ${blockquoteBorder} pl-4 select-none`}>
              « {citation} »
            </blockquote>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 px-6 rounded-full bg-primary text-white font-semibold text-lg shadow-md hover:bg-primary/90 transition mb-2"
            >
              Créer un compte ou se connecter
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

// ... (reste du code d'origine pour l'utilisateur connecté)
return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 px-4 py-8 md:px-6 md:py-10 container mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="font-medium">Ma collection de films</h2>
            <p className="text-muted-foreground mt-1">
              {filteredFilms.length} film{filteredFilms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-pulse">Chargement...</div>
          </div>
        ) : filteredFilms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredFilms.map((film) => (
              <FilmCard 
                key={film.id}
                film={{ ...film, annee: film.annee || (film.dateVue ? String(new Date(film.dateVue).getFullYear()) : undefined) }}
                isNew={film.id === lastAddedFilmId && !!film.resume}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-center mb-2">
              Vous n'avez pas encore ajouté de films à votre collection
            </p>
            <button 
              onClick={() => navigate('/ajouter')}
              className="mt-4 text-primary hover:underline"
            >
              Ajouter votre premier film
            </button>
          </div>
        )}
      </main>
    <Footer />
    </div>
  );
};

export default Index;
