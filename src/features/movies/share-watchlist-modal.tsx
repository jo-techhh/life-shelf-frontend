import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shareApi } from '@/api/share.api';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/toast-context';
import { Copy, Check, Share2, ShieldAlert, Globe, Loader2, Link2 } from 'lucide-react';

export interface ShareWatchListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareWatchListModal({ isOpen, onClose }: ShareWatchListModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  // Fetch current share status
  const { data: shareStatus, isLoading } = useQuery({
    queryKey: ['shareWatchStatus'],
    queryFn: shareApi.getStatus,
    enabled: isOpen,
  });

  // Enable / generate share link mutation
  const enableMutation = useMutation({
    mutationFn: shareApi.enable,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shareWatchStatus'] });
      toast.success('Public share link generated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to enable share link');
    },
  });

  // Revoke share link mutation
  const revokeMutation = useMutation({
    mutationFn: shareApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareWatchStatus'] });
      toast.success('Share link revoked successfully');
      setShowRevokeConfirm(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to revoke link');
    },
  });

  const shareUrl = shareStatus?.token
    ? `${window.location.origin}/shared/watch/${shareStatus.token}`
    : '';

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        setShowRevokeConfirm(false);
        onClose();
      }}
      title="Share Watched Shelf"
      description="Create a public, read-only link to share movies & series you have watched."
      size="md"
    >
      <div className="space-y-6 pt-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Checking share status...</span>
          </div>
        ) : shareStatus?.isActive && shareStatus?.token ? (
          <div className="space-y-5">
            {/* Status indicator */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300">Public Link is Active</p>
                  <p className="text-[11px] text-emerald-400/80">Anyone with this link can view your watched list.</p>
                </div>
              </div>
            </div>

            {/* Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Shareable URL</label>
              <div className="flex items-center gap-2 p-1.5 bg-background border border-border rounded-xl">
                <div className="pl-2.5 text-muted-foreground">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-transparent text-xs text-foreground font-mono focus:outline-none select-all px-1"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopy}
                  className="gap-1.5 shrink-0 h-8 px-3 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Privacy details */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <span>🔒 Privacy Protection</span>
              </p>
              <p>• Only items marked as <strong>WATCHED</strong> are included.</p>
              <p>• Your personal notes, planned items, and private tags are completely hidden.</p>
              <p>• If you revoke the link below, visitors will see a clear notice that access has been revoked.</p>
            </div>

            {/* Revoke section */}
            {!showRevokeConfirm ? (
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-xs text-muted-foreground">Want to disable this link?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeConfirm(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                  Revoke Link
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-destructive">Are you sure you want to revoke this link?</p>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Anyone trying to view this link afterwards will be shown a notification that access was revoked by you.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRevokeConfirm(false)}
                    disabled={revokeMutation.isPending}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeMutation.mutate()}
                    disabled={revokeMutation.isPending}
                    className="h-8 text-xs gap-1.5"
                  >
                    {revokeMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )}
                    Yes, Revoke Access
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Sharing Inactive / Not created yet */
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-foreground">Sharing is Currently Turned Off</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate a secure, private link to show your friends everything you have watched. You can revoke it anytime.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => enableMutation.mutate()}
                disabled={enableMutation.isPending}
                className="gap-2 px-5"
              >
                {enableMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                Create Public Share Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
