import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth-context';
import { useTheme } from '@/app/theme-provider';
import { storageApi, ConfigureCloudinaryDto } from '@/api/storage.api';
import { authApi } from '@/api/auth.api';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/app/toast-context';
import {
  Settings,
  User,
  Sun,
  Moon,
  Laptop,
  Cloud,
  Shield,
  CheckCircle2,
  Lock,
  LogOut,
  AlertCircle,
  Key,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('profile');

  // Profile Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Cloudinary Storage state
  const [cloudName, setCloudName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isDeleteStorageOpen, setIsDeleteStorageOpen] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Query Cloud Storage configuration
  const { data: storageConfig, isLoading: isLoadingStorage } = useQuery({
    queryKey: ['storage', 'config'],
    queryFn: () => storageApi.getConfig(),
  });

  // Configure Cloudinary mutation
  const configureStorageMutation = useMutation({
    mutationFn: (data: ConfigureCloudinaryDto) => storageApi.configureCloudinary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Cloudinary storage successfully connected and encrypted');
      setApiSecret('');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete Cloudinary mutation
  const deleteStorageMutation = useMutation({
    mutationFn: () => storageApi.deleteConfig(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Cloud storage configuration removed');
      setIsDeleteStorageOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      toast.success('Profile updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password change failed';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary" />
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal profile, appearance, custom cloud storage, and security.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'appearance', label: 'Appearance', icon: <Sun className="w-3.5 h-3.5" /> },
          { id: 'storage', label: 'Cloud Storage', icon: <Cloud className="w-3.5 h-3.5" /> },
          { id: 'security', label: 'Security', icon: <Shield className="w-3.5 h-3.5" /> },
        ]}
      />

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border/60">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border text-foreground font-bold text-lg flex items-center justify-center">
                {getInitials(user?.displayName || user?.username)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">
                {user?.displayName || user?.username}
              </h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 max-w-lg">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your preferred name"
            />

            <Input
              label="Username"
              value={user?.username || ''}
              disabled
              className="bg-muted/40 text-muted-foreground cursor-not-allowed"
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="bg-muted/40 text-muted-foreground cursor-not-allowed"
            />

            <Input
              label="Avatar Image URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />

            <Button
              type="submit"
              size="sm"
              isLoading={isUpdatingProfile}
              className="self-start mt-2"
            >
              Save Profile
            </Button>
          </form>
        </div>
      )}

      {/* TAB 2: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">Interface Theme</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose your preferred visual theme. LifeShelf automatically adapts to your system setting or stays in Light/Dark.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'light' as const,
                label: 'Light Mode',
                description: 'Crisp, clean personal library palette',
                icon: Sun,
              },
              {
                id: 'dark' as const,
                label: 'Dark Mode',
                description: 'Deep, calm night aesthetic',
                icon: Moon,
              },
              {
                id: 'system' as const,
                label: 'System Default',
                description: 'Follows your operating system theme',
                icon: Laptop,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'border-border/70 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-foreground block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed mt-0.5 block">
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CLOUD STORAGE */}
      {activeTab === 'storage' && (
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-display text-foreground">Cloud Storage Setup</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Store your LifeShelf images and media posters directly in your own personal Cloudinary account.
            </p>
          </div>

          {/* Security Alert */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/90 leading-relaxed">
              <span className="font-semibold block text-primary mb-0.5">Encrypted at Rest</span>
              Your Cloudinary credentials are encrypted using AES-256-GCM before being stored in PostgreSQL. Secrets are never exposed in API responses or logs.
            </div>
          </div>

          {/* Active Connected State Banner */}
          {storageConfig?.isConfigured ? (
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Cloudinary Connected
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Cloud: <strong>{storageConfig.cloudName}</strong></span>
                    <span>API Key: <code>{storageConfig.apiKeyMasked}</code></span>
                    <span>Secret: <code>••••••••••••</code></span>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteStorageOpen(true)}
              >
                Disconnect
              </Button>
            </div>
          ) : null}

          {/* Setup / Update Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              configureStorageMutation.mutate({ cloudName, apiKey, apiSecret });
            }}
            className="flex flex-col gap-4 max-w-lg pt-2"
          >
            <h3 className="text-sm font-semibold text-foreground">
              {storageConfig?.isConfigured ? 'Update Cloudinary Credentials' : 'Connect Cloudinary Account'}
            </h3>

            <Input
              label="Cloud Name *"
              placeholder="e.g. my-shelf-cloud"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              required
            />

            <Input
              label="API Key *"
              placeholder="e.g. 123456789012345"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />

            <Input
              label="API Secret *"
              type="password"
              placeholder="••••••••••••••••"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="sm"
              isLoading={configureStorageMutation.isPending}
              className="self-start mt-2 gap-2"
            >
              <Key className="w-4 h-4" />
              Save Configuration
            </Button>
          </form>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">Security & Passwords</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change your password and manage account security.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="sm"
              isLoading={isChangingPassword}
              className="self-start mt-2 gap-2"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </Button>
          </form>

          <div className="pt-6 border-t border-border/60 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Session</h3>
            <p className="text-xs text-muted-foreground">
              Sign out of your LifeShelf account on this browser.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="self-start gap-2 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Disconnect Storage Dialog */}
      <ConfirmDialog
        isOpen={isDeleteStorageOpen}
        onClose={() => setIsDeleteStorageOpen(false)}
        onConfirm={() => deleteStorageMutation.mutate()}
        title="Disconnect Cloudinary?"
        description="Your Cloudinary credentials will be removed. Built-in default images will remain accessible."
        confirmLabel="Disconnect"
        isLoading={deleteStorageMutation.isPending}
      />
    </div>
  );
}
