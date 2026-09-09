import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/api/media.api';
import { MediaAsset } from '@/types';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  FolderArchive,
  UploadCloud,
  Sparkles,
  Search,
  Trash2,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function MediaPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'defaults'>('my');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteAsset, setDeleteAsset] = useState<MediaAsset | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query user media
  const {
    data: userMedia,
    isLoading: isLoadingUser,
    isError: isUserError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['media', 'user', page, search],
    queryFn: () => mediaApi.listUserMedia(page, 24, search.trim() || undefined),
    enabled: activeTab === 'my',
  });

  // Query default covers
  const {
    data: defaultMedia,
    isLoading: isLoadingDefaults,
    isError: isDefaultsError,
    refetch: refetchDefaults,
  } = useQuery({
    queryKey: ['media', 'defaults'],
    queryFn: () => mediaApi.getDefaultAssets(),
    enabled: activeTab === 'defaults',
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Image uploaded to your media library');
      handleCloseUpload();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media asset deleted');
      setDeleteAsset(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WEBP formats are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
            <FolderArchive className="w-7 h-7 text-primary" />
            Media Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your personal uploaded images and system default covers.
          </p>
        </div>

        <Button onClick={() => setIsUploadOpen(true)} size="sm" className="gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload Image
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border/60 p-4 rounded-2xl shadow-sm">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as 'my' | 'defaults');
            setPage(1);
          }}
          tabs={[
            { id: 'my', label: 'My Images' },
            { id: 'defaults', label: 'Default System Covers' },
          ]}
        />

        {activeTab === 'my' && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search images..."
              className="pl-9 h-10 text-xs"
            />
          </div>
        )}
      </div>

      {/* Tab Content: My Images */}
      {activeTab === 'my' && (
        <>
          {isLoadingUser ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />
              ))}
            </div>
          ) : isUserError ? (
            <ErrorState
              title="Failed to load media"
              message="Could not load your uploaded images."
              onRetry={() => refetchUser()}
            />
          ) : userMedia?.data && userMedia.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {userMedia.data.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                  >
                    <div className="relative aspect-[2/3] w-full bg-muted overflow-hidden">
                      <img
                        src={asset.secureUrl || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <a
                          href={asset.secureUrl || asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button variant="secondary" size="sm" className="w-full text-xs gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </Button>
                        </a>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteAsset(asset)}
                          className="w-full text-xs gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-foreground truncate block">
                        {asset.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(asset.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {userMedia.pagination && userMedia.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-border/60 text-xs text-muted-foreground">
                  <span>
                    Page {userMedia.pagination.page} of {userMedia.pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= userMedia.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<UploadCloud className="w-6 h-6" />}
              title="No uploaded images"
              description="Upload book covers, movie posters, destination photos, and avatars."
              actionLabel="Upload First Image"
              onAction={() => setIsUploadOpen(true)}
            />
          )}
        </>
      )}

      {/* Tab Content: Default Covers */}
      {activeTab === 'defaults' && (
        <>
          {isLoadingDefaults ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />
              ))}
            </div>
          ) : isDefaultsError ? (
            <ErrorState
              title="Failed to load default covers"
              message="Could not load system covers."
              onRetry={() => refetchDefaults()}
            />
          ) : defaultMedia && defaultMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {defaultMedia.map((asset) => (
                <div
                  key={asset.id}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-[2/3] w-full bg-muted/40 overflow-hidden">
                    <img
                      src={asset.secureUrl || asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 backdrop-blur-md">
                        <Sparkles className="w-3 h-3" /> System
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {asset.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize mt-0.5">
                      {asset.type.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No default covers found.
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={handleCloseUpload}
        title="Upload Image"
        description="Upload an image to your personal Cloudinary storage."
        size="md"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-48 aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-md">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-background/80 text-foreground p-1 rounded-full shadow hover:bg-background"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCloseUpload}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
                  isLoading={uploadMutation.isPending}
                  className="gap-1.5"
                >
                  <Check className="w-4 h-4" /> Upload File
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Click to select an image</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, or WEBP (up to 5MB)</p>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteAsset}
        onClose={() => setDeleteAsset(null)}
        onConfirm={() => deleteAsset && deleteMutation.mutate(deleteAsset.id)}
        title="Delete Image?"
        description="This image will be removed from your media library. If any shelf items are using this image, their cover reference will be cleared."
        confirmLabel="Delete Image"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
