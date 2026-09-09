import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Episode } from '@/types';

export interface EpisodeNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
  seasonNumber?: number;
  onSave: (episodeId: string, note: string) => void;
  isLoading?: boolean;
}

export function EpisodeNoteModal({
  isOpen,
  onClose,
  episode,
  seasonNumber = 1,
  onSave,
  isLoading = false,
}: EpisodeNoteModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (episode) {
      setNote(episode.note || '');
    }
  }, [episode]);

  if (!episode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(episode.id, note.trim());
  };

  const titleFormatted = `S${String(seasonNumber).padStart(2, '0')}E${String(episode.episodeNumber).padStart(2, '0')} — ${
    episode.title || `Episode ${episode.episodeNumber}`
  }`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Episode Note"
      description={titleFormatted}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          placeholder="What did you think of this episode? Favorite moments, plot twists..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          autoFocus
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Save Note
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
