import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/api/media.api';
import { MediaAsset } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/app/toast-context';
import { UploadCloud, Image as ImageIcon, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImagePickerProps {
  value?: string | null; // mediaAssetId
  currentAsset?: MediaAsset | null;
  onChange: (assetId: string | null, asset: MediaAsset | null) => void;
  label?: string;
}

export function ImagePicker({ value, currentAsset, onChange, label = 'Cover Image' }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'defaults'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch User Media Library
  const { data: mediaData, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['media', 'user'],
    queryFn: () => mediaApi.listUserMedia(1, 30),
    enabled: isOpen && activeTab === 'library',
  });

  // Fetch Default System Covers
  const { data: defaultAssets, isLoading: isLoadingDefaults } = useQuery({
    queryKey: ['media', 'defaults'],
    queryFn: () => mediaApi.getDefaultAssets(),
    enabled: isOpen && activeTab === 'defaults',
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadImage(file),
    onSuccess: (newAsset) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onChange(newAsset.id, newAsset);
      toast.success('Image uploaded and selected');
      handleClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload image');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadAndSave = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleSelectExisting = (asset: MediaAsset) => {
    onChange(asset.id, asset);
    toast.success('Image selected');
    handleClose();
  };

  const handleRemove = () => {
    onChange(null, null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const displayImage = currentAsset?.secureUrl || currentAsset?.url;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}

      {/* Selected Image Card or Empty Placeholder */}
      {displayImage ? (
        <div className="relative group w-full max-w-[220px] aspect-[2/3] rounded-2xl overflow-hidden border border-border/70 bg-card shadow-sm">
          <img
            src={displayImage}
            alt={currentAsset?.name || 'Cover'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="w-full text-xs shadow"
            >
              Change Image
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="w-full text-xs shadow"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center gap-2 w-full max-w-[220px] aspect-[2/3] rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer p-4 text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Choose Cover
          </span>
          <span className="text-[10px] text-muted-foreground/60">Upload or Pick</span>
        </button>
      )}

      {/* Image Picker Modal */}
      <Dialog isOpen={isOpen} onClose={handleClose} title="Choose Cover Image" size="lg">
        <div className="flex flex-col gap-5">
          {/* Picker Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'upload'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <UploadCloud className="w-4 h-4" />
              Upload New
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'library'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              My Images
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('defaults')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'defaults'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Default Covers
            </button>
          </div>

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
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
                      className="absolute top-2 right-2 bg-background/80 text-foreground p-1 rounded-full shadow hover:bg-background transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleUploadAndSave}
                    isLoading={uploadMutation.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Use This Image
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Click to upload file</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, or WEBP (up to 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY IMAGES */}
          {activeTab === 'library' && (
            <div className="py-2">
              {isLoadingMedia ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading your images...</span>
                </div>
              ) : mediaData?.data?.length ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
                  {mediaData.data.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectExisting(asset)}
                      className={cn(
                        'group relative aspect-[2/3] rounded-xl overflow-hidden border transition-all cursor-pointer text-left',
                        value === asset.id
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-border/60 hover:border-primary/50'
                      )}
                    >
                      <img
                        src={asset.secureUrl || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[11px] font-medium text-white truncate w-full">
                          {asset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No images uploaded yet. Upload one via the Upload tab!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEFAULT COVERS */}
          {activeTab === 'defaults' && (
            <div className="py-2">
              {isLoadingDefaults ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading default covers...</span>
                </div>
              ) : defaultAssets?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                  {defaultAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectExisting(asset)}
                      className={cn(
                        'group relative aspect-[2/3] rounded-xl overflow-hidden border transition-all cursor-pointer text-left bg-muted/40',
                        value === asset.id
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-border/60 hover:border-primary/50'
                      )}
                    >
                      <img
                        src={asset.secureUrl || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm p-2 border-t border-border/40">
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {asset.type.toLowerCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No default covers found.
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
