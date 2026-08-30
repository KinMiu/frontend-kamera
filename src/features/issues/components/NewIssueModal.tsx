import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCreateGitHubIssue } from '@/features/issues/hooks/use-github-issues';
import { AlertCircle, ExternalLink, Loader2, Plus, Tag } from 'lucide-react';

const newIssueSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul issue minimal 5 karakter')
    .max(150, 'Judul issue maksimal 150 karakter'),
  body: z.string().min(10, 'Deskripsi issue minimal 10 karakter'),
});

type NewIssueFormValues = z.infer<typeof newIssueSchema>;

interface NewIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: string;
  repo?: string;
}

const AVAILABLE_LABELS = [
  { name: 'bug', color: 'd73a4a', label: 'Bug' },
  { name: 'enhancement', color: 'a2eeef', label: 'Enhancement' },
  { name: 'rtsp-stream', color: '0075ca', label: 'RTSP Stream' },
  { name: 'device-hardware', color: 'e4e669', label: 'Hardware' },
  { name: 'documentation', color: '0075ca', label: 'Documentation' },
];

export function NewIssueModal({
  open,
  onOpenChange,
  owner = 'KinMiu',
  repo = 'frontend-kamera',
}: NewIssueModalProps) {
  const createIssue = useCreateGitHubIssue();
  const [selectedLabels, setSelectedLabels] = useState<string[]>(['enhancement']);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewIssueFormValues>({
    resolver: zodResolver(newIssueSchema),
    defaultValues: {
      title: '',
      body: '',
    },
  });

  const formValues = watch();

  const toggleLabel = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName) ? prev.filter((l) => l !== labelName) : [...prev, labelName]
    );
  };

  const onSubmit = async (values: NewIssueFormValues) => {
    await createIssue.mutateAsync({
      payload: {
        title: values.title.trim(),
        body: values.body.trim(),
        labels: selectedLabels,
      },
      owner,
      repo,
    });
    reset();
    setSelectedLabels(['enhancement']);
    onOpenChange(false);
  };

  const openOnGitHub = () => {
    const title = encodeURIComponent(formValues.title || '');
    const body = encodeURIComponent(formValues.body || '');
    const labels = encodeURIComponent(selectedLabels.join(','));
    const url = `https://github.com/${owner}/${repo}/issues/new?title=${title}&body=${body}&labels=${labels}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Buat GitHub Issue Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Laporkan tiket bug atau fitur baru pada repositori{' '}
                <strong className="text-foreground">{owner}/{repo}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Issue <span className="text-destructive">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Contoh: Bug: Stream RTSP freeze saat reconnect"
              className="h-10 text-sm"
              disabled={createIssue.isPending}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Labels Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Pilih Label
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LABELS.map((item) => {
                const isSelected = selectedLabels.includes(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => toggleLabel(item.name)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi Masalah / Rincian <span className="text-destructive">*</span>
            </label>
            <Textarea
              {...register('body')}
              placeholder="Jelaskan detail kendala, langkah reproduksi bug, atau spesifikasi fitur yang diajukan..."
              className="min-h-[120px] text-xs font-sans leading-relaxed resize-y"
              disabled={createIssue.isPending}
            />
            {errors.body && (
              <p className="text-xs text-destructive font-medium">{errors.body.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 flex-col sm:flex-row gap-2 sm:justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openOnGitHub}
              className="text-xs h-9 gap-1.5 w-full sm:w-auto"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka di GitHub.com</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={createIssue.isPending}
                className="text-xs h-9"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createIssue.isPending}
                className="text-xs h-9 gap-1.5"
              >
                {createIssue.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit Issue</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
