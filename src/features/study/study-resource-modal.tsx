import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CreateStudyResourceDto } from '@/api/studylist.api';

export interface StudyResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudyResourceDto) => void;
  studyTitle?: string;
  isLoading?: boolean;
}

export function StudyResourceModal({
  isOpen,
  onClose,
  onSubmit,
  studyTitle,
  isLoading = false,
}: StudyResourceModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DOCUMENTATION');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (url.trim()) {
      try {
        new URL(url.trim());
      } catch {
        setError('Please enter a valid URL (e.g. https://...)');
        return;
      }
    }

    setError('');
    onSubmit({
      title: title.trim(),
      url: url.trim() || undefined,
      type,
      notes: notes.trim() || undefined,
    });
    // reset
    setTitle('');
    setUrl('');
    setType('DOCUMENTATION');
    setNotes('');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Learning Resource"
      description={`Add a reference, course, or doc to ${studyTitle || 'this topic'}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Resource Title *"
          placeholder="e.g. Official Documentation or YouTube Playlist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          required
        />

        <Input
          label="URL / Link"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Select
          label="Resource Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { label: 'Official Documentation', value: 'DOCUMENTATION' },
            { label: 'Video Course / YouTube', value: 'VIDEO' },
            { label: 'GitHub Repository', value: 'REPOSITORY' },
            { label: 'Article / Blog', value: 'ARTICLE' },
            { label: 'Interactive Tutorial', value: 'TUTORIAL' },
            { label: 'Book / Reference', value: 'BOOK' },
            { label: 'Other', value: 'OTHER' },
          ]}
        />

        <Textarea
          label="Notes (optional)"
          placeholder="Key chapters, login credentials, or reminders..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Add Resource
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
