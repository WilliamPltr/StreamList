
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '@/components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import RatingStars from '@/components/RatingStars';
import DatePicker from '@/components/DatePicker';
import { Film } from '@/components/FilmCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Trash, Save, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DetailFilm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<number>(0);
  const [resume, setResume] = useState('');
  const [dateVue, setDateVue] = useState<Date | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchFilm = async () => {
      if (!id) {
        toast.error("Identifiant du film manquant");
        navigate('/');
        return;
      }

      try {
        console.log("Récupération du film avec id:", id);
        
        // Récupérer le film depuis Supabase
        const { data, error } = await supabase
          .from('films')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        console.log("Résultat de la requête:", data, "Erreur:", error);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convertir la dateVue de string à Date si elle existe
          const filmWithDate = {
            ...data,
            dateVue: data.dateVue ? new Date(data.dateVue) : undefined
          };
          
          setFilm(filmWithDate);
          setNote(filmWithDate.note || 0);
          setResume(filmWithDate.resume || '');
          setDateVue(filmWithDate.dateVue);
        } else {
          toast.error("Film non trouvé");
          navigate('/');
        }
      } catch (error) {
        console.error("Erreur lors du chargement du film:", error);
        toast.error("Impossible de charger les détails du film");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFilm();
    }
  }, [id, navigate, user]);

  const handleSave = async () => {
    if (!film || !id) return;

    try {
      // Mettre à jour l'objet film
      const updatedFilm = {
        note,
        resume,
        dateVue: dateVue ? dateVue.toISOString() : null
      };

      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('films')
        .update(updatedFilm)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setFilm({
        ...film,
        ...updatedFilm,
        dateVue
      });
      setIsEditing(false);
      toast.success("Film mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Impossible de mettre à jour le film");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce film ?") || !id) return;

    try {
      const { error } = await supabase
        .from('films')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success("Film supprimé avec succès");
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer le film");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <div className="flex-1 flex items-center justify-center">
          <p>Film non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-10">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-enter">
          {/* Colonne gauche - Image */}
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden border border-border bg-card shadow-sm">
              <img 
                src={film.image} 
                alt={film.titre} 
                className="w-full h-auto object-cover aspect-[2/3]"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Note</h3>
                {isEditing ? (
                  <RatingStars rating={note} onChange={setNote} />
                ) : (
                  <div className="flex items-center">
                    <RatingStars rating={film.note || 0} onChange={() => {}} />
                    <span className="ml-2 text-sm">
                      {film.note ? `${film.note}/5` : 'Non noté'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de visionnage</h3>
                {isEditing ? (
                  <DatePicker 
                    date={dateVue} 
                    onSelect={(date) => setDateVue(date)}
                    label="Sélectionner une date" 
                  />
                ) : (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {film.dateVue ? (
                      format(film.dateVue, 'dd MMMM yyyy', { locale: fr })
                    ) : (
                      <span className="text-muted-foreground">Non spécifiée</span>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full mb-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDelete}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}

              {isEditing && (
                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    className="w-full"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setIsEditing(false);
                      setNote(film.note || 0);
                      setResume(film.resume || '');
                      setDateVue(film.dateVue);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Informations */}
          <div className="md:col-span-2">
            {/* Affichage du résumé sans titre ni sous-titre */}
            <div className="space-y-6">
              <div>
                {isEditing ? (
                  <Textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Écrivez un résumé du film, les personnages principaux, le réalisateur..."
                    className="h-64 bg-secondary border-secondary"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {film.resume ? (
  <div className="markdown-body">
    {film.resume.includes('--ESPACE--')
      ? film.resume.split(/--ESPACE--/g).map((block, idx) => (
          <div key={idx} style={{ marginBottom: 24 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {block.trim()}
            </ReactMarkdown>
          </div>
        ))
      : <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{film.resume}</ReactMarkdown>
    }
  </div>
) : (
  <p className="text-muted-foreground">Aucun résumé disponible</p>
)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailFilm;
