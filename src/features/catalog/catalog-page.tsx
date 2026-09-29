import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import { CatalogMovie, CatalogBook } from '@/types';
import { useAuth } from '@/app/auth-context';
import { useToast } from '@/app/toast-context';
import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardSkeletonGrid } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { CatalogItemCard } from './catalog-item-card';
import { AddToShelfModal } from './add-to-shelf-modal';
import { CatalogManageModal } from './catalog-manage-modal';
import {
  Sparkles,
  Film,
  BookOpen,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';

export function CatalogPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'movies' | 'books'>('movies');
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedAddToShelf, setSelectedAddToShelf] = useState<{
    item: CatalogMovie | CatalogBook;
    type: 'movie' | 'book';
  } | null>(null);

  const [manageModal, setManageModal] = useState<{
    isOpen: boolean;
    type: 'movie' | 'book';
    initialData?: CatalogMovie | CatalogBook | null;
  }>({
    isOpen: false,
    type: 'movie',
    initialData: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    item: CatalogMovie | CatalogBook | null;
    type: 'movie' | 'book';
  }>({
    isOpen: false,
    item: null,
    type: 'movie',
  });

  // Query Movies
  const {
    data: moviesData,
    isLoading: isLoadingMovies,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: ['catalog', 'movies', page, search, genreFilter],
    queryFn: () =>
      catalogApi.listMovies({
        page,
        limit: 18,
        search: search.trim() || undefined,
        genre: genreFilter || undefined,
      }),
    enabled: activeTab === 'movies',
  });

  // Query Books
  const {
    data: booksData,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ['catalog', 'books', page, search, genreFilter],
    queryFn: () =>
      catalogApi.listBooks({
        page,
        limit: 18,
        search: search.trim() || undefined,
        genre: genreFilter || undefined,
      }),
    enabled: activeTab === 'books',
  });

  // Delete Mutations
  const deleteMovieMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'movies'] });
      toast.success('Curated movie removed from catalog');
      setDeleteConfirm({ isOpen: false, item: null, type: 'movie' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'books'] });
      toast.success('Curated book removed from catalog');
      setDeleteConfirm({ isOpen: false, item: null, type: 'book' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isCurrentLoading = activeTab === 'movies' ? isLoadingMovies : isLoadingBooks;
  const currentResponse = activeTab === 'movies' ? moviesData : booksData;
  const items = currentResponse?.data || [];
  const pagination = currentResponse?.pagination;

  const handleEdit = (item: CatalogMovie | CatalogBook, type: 'movie' | 'book') => {
    setManageModal({
      isOpen: true,
      type,
      initialData: item,
    });
  };

  const handleDeletePrompt = (item: CatalogMovie | CatalogBook, type: 'movie' | 'book') => {
    setDeleteConfirm({
      isOpen: true,
      item,
      type,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm.item) return;
    if (deleteConfirm.type === 'movie') {
      deleteMovieMutation.mutate(deleteConfirm.item.id);
    } else {
      deleteBookMutation.mutate(deleteConfirm.item.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        icon={<Sparkles className="w-5 h-5 text-primary" />}
        title="Curated Catalog"
        description="Browse popular and recommended movies and books. Add them straight to your personal shelf with complete metadata and covers."
        action={
          isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  setManageModal({
                    isOpen: true,
                    type: activeTab === 'movies' ? 'movie' : 'book',
                    initialData: null,
                  })
                }
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Curated {activeTab === 'movies' ? 'Movie' : 'Book'}
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Admin Notice Banner if Admin */}
      {isAdmin && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold">Admin Catalog Manager Active</p>
              <p className="text-[11px] opacity-80">
                You have admin privileges to publish, edit, and curate popular titles and upload official posters. Regular users can select and use these entries.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/40 hover:bg-amber-500/20 text-xs shrink-0"
            onClick={() =>
              setManageModal({
                isOpen: true,
                type: activeTab === 'movies' ? 'movie' : 'book',
                initialData: null,
              })
            }
          >
            + Create New
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <FilterBar
        tabs={
          <Tabs
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab as 'movies' | 'books');
              setPage(1);
              setGenreFilter('');
            }}
            tabs={[
              {
                id: 'movies',
                label: `Movies ${moviesData?.pagination?.total ? `(${moviesData.pagination.total})` : ''}`,
                icon: <Film className="w-4 h-4" />,
              },
              {
                id: 'books',
                label: `Books ${booksData?.pagination?.total ? `(${booksData.pagination.total})` : ''}`,
                icon: <BookOpen className="w-4 h-4" />,
              },
            ]}
          />
        }
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search curated ${activeTab === 'movies' ? 'movies by title, director, cast...' : 'books by title, author, genre...'}`}
              className="pl-9 h-9.5 text-xs bg-card"
            />
          </div>
        }
        filters={
          <Select
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setPage(1);
            }}
            className="h-9.5 text-xs w-36 bg-card"
            options={[
              { label: 'All Genres', value: '' },
              ...(activeTab === 'movies'
                ? [
                    { label: 'Sci-Fi', value: 'Sci-Fi' },
                    { label: 'Action', value: 'Action' },
                    { label: 'Drama', value: 'Drama' },
                    { label: 'Comedy', value: 'Comedy' },
                    { label: 'Thriller', value: 'Thriller' },
                    { label: 'Adventure', value: 'Adventure' },
                    { label: 'Animation', value: 'Animation' },
                  ]
                : [
                    { label: 'Self-Help', value: 'Self-Help' },
                    { label: 'Non-Fiction', value: 'Non-Fiction' },
                    { label: 'Sci-Fi', value: 'Sci-Fi' },
                    { label: 'Fiction', value: 'Fiction' },
                    { label: 'Business', value: 'Business' },
                    { label: 'Psychology', value: 'Psychology' },
                    { label: 'Technology', value: 'Technology' },
                  ]),
            ]}
          />
        }
      />

      {/* Catalog Grid */}
      {isCurrentLoading ? (
        <CardSkeletonGrid count={12} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={activeTab === 'movies' ? <Film className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
          title={`No curated ${activeTab} found`}
          description={
            search || genreFilter
              ? 'Try adjusting your search keywords or filter criteria.'
              : `The curated ${activeTab} catalog is currently empty. ${isAdmin ? 'As an admin, you can add popular titles now!' : 'Check back soon as admins curate more titles.'}`
          }
          actionLabel={isAdmin ? `Add Curated ${activeTab === 'movies' ? 'Movie' : 'Book'}` : undefined}
          onAction={
            isAdmin
              ? () =>
                  setManageModal({
                    isOpen: true,
                    type: activeTab === 'movies' ? 'movie' : 'book',
                    initialData: null,
                  })
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              type={activeTab === 'movies' ? 'movie' : 'book'}
              isAdmin={isAdmin}
              onAddToShelf={(it, tp) => setSelectedAddToShelf({ item: it, type: tp })}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add To Shelf Modal */}
      {selectedAddToShelf && (
        <AddToShelfModal
          isOpen={!!selectedAddToShelf}
          onClose={() => setSelectedAddToShelf(null)}
          item={selectedAddToShelf.item}
          type={selectedAddToShelf.type}
        />
      )}

      {/* Admin Manage Modal */}
      {manageModal.isOpen && (
        <CatalogManageModal
          isOpen={manageModal.isOpen}
          onClose={() => setManageModal({ isOpen: false, type: 'movie', initialData: null })}
          type={manageModal.type}
          initialData={manageModal.initialData}
        />
      )}

      {/* Admin Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, type: 'movie' })}
        onConfirm={handleConfirmDelete}
        title={`Delete Curated ${deleteConfirm.type === 'movie' ? 'Movie' : 'Book'}`}
        description={`Are you sure you want to delete "${deleteConfirm.item?.title}" from the curated catalog? Users who have already added this to their shelves will keep their records.`}
        confirmLabel="Delete from Catalog"
        isDestructive
        isLoading={deleteMovieMutation.isPending || deleteBookMutation.isPending}
      />
    </div>
  );
}
