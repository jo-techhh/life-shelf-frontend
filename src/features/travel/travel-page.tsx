import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { travelApi } from '@/api/travel.api';
import { TravelPlace, TravelStatus, Trip, TripStatus } from '@/types';
import { PlaceFormModal, PlaceFormValues } from './place-form-modal';
import { TripFormModal, TripFormValues } from './trip-form-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Edit2,
  Trash2,
  Navigation,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export function TravelPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('WANT_TO_VISIT');
  const [search, setSearch] = useState('');

  // Modals state
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(searchParams.get('add') === 'true');
  const [editingPlace, setEditingPlace] = useState<TravelPlace | null>(null);
  const [deletePlaceId, setDeletePlaceId] = useState<string | null>(null);

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);

  // Add place to trip modal
  const [addPlaceToTripTarget, setAddPlaceToTripTarget] = useState<Trip | null>(null);
  const [selectedPlaceIdToAdd, setSelectedPlaceIdToAdd] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isTripsTab = activeTab === 'TRIPS';

  // Query Places
  const {
    data: placesData,
    isLoading: isLoadingPlaces,
    isError: isPlacesError,
    refetch: refetchPlaces,
  } = useQuery({
    queryKey: ['travel', 'places', activeTab, search],
    queryFn: () =>
      travelApi.listPlaces({
        status: activeTab as TravelStatus,
        search: search.trim() || undefined,
        limit: 30,
      }),
    enabled: !isTripsTab,
  });

  // Query Trips
  const {
    data: tripsData,
    isLoading: isLoadingTrips,
    isError: isTripsError,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['travel', 'trips', search],
    queryFn: () => travelApi.listTrips({ search: search.trim() || undefined, limit: 30 }),
    enabled: isTripsTab,
  });

  // Query All Places for Trip Dropdown
  const { data: allPlacesData } = useQuery({
    queryKey: ['travel', 'allPlaces'],
    queryFn: () => travelApi.listPlaces({ limit: 100 }),
    enabled: !!addPlaceToTripTarget,
  });

  // Mutations for Places
  const createPlaceMutation = useMutation({
    mutationFn: (values: PlaceFormValues) =>
      travelApi.createPlace({
        ...values,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Destination added');
      setIsPlaceModalOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePlaceMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<PlaceFormValues> }) =>
      travelApi.updatePlace(id, {
        ...values,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel'] });
      toast.success('Destination updated');
      setIsPlaceModalOpen(false);
      setEditingPlace(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePlaceMutation = useMutation({
    mutationFn: (id: string) => travelApi.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel'] });
      toast.success('Destination removed');
      setDeletePlaceId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Mutations for Trips
  const createTripMutation = useMutation({
    mutationFn: (values: TripFormValues) =>
      travelApi.createTrip({
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', 'trips'] });
      toast.success('Trip itinerary created');
      setIsTripModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TripFormValues> }) =>
      travelApi.updateTrip(id, {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', 'trips'] });
      toast.success('Trip itinerary updated');
      setIsTripModalOpen(false);
      setEditingTrip(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTripMutation = useMutation({
    mutationFn: (id: string) => travelApi.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', 'trips'] });
      toast.success('Trip deleted');
      setDeleteTripId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add place to trip mutation
  const addPlaceToTripMutation = useMutation({
    mutationFn: ({ tripId, placeId }: { tripId: string; placeId: string }) =>
      travelApi.addPlaceToTrip(tripId, { placeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', 'trips'] });
      toast.success('Destination linked to trip');
      setAddPlaceToTripTarget(null);
      setSelectedPlaceIdToAdd('');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Remove place from trip mutation
  const removePlaceFromTripMutation = useMutation({
    mutationFn: ({ tripId, placeId }: { tripId: string; placeId: string }) =>
      travelApi.removePlaceFromTrip(tripId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', 'trips'] });
      toast.success('Destination removed from trip');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-primary" />
            Travel & Trips
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Bucket list destinations, trip planning itineraries, budgets, and memorable visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isTripsTab ? (
            <Button
              onClick={() => {
                setEditingTrip(null);
                setIsTripModalOpen(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Trip
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingPlace(null);
                setIsPlaceModalOpen(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Place
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 bg-card/60 border border-border/60 p-4 rounded-2xl shadow-sm">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'WANT_TO_VISIT', label: 'Want to Visit' },
            { id: 'PLANNING', label: 'Planning' },
            { id: 'VISITED', label: 'Visited' },
            { id: 'TRIPS', label: 'Trips Itinerary' },
          ]}
        />

        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTripsTab ? 'Search trips...' : 'Search places by name, country, city...'}
            className="pl-9 h-10 text-xs"
          />
        </div>
      </div>

      {/* Content for Places */}
      {!isTripsTab && (
        <>
          {isLoadingPlaces ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : isPlacesError ? (
            <ErrorState
              title="Failed to load destinations"
              message="Could not connect to the server."
              onRetry={() => refetchPlaces()}
            />
          ) : placesData?.data && placesData.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {placesData.data.map((place) => {
                const photo = place.mediaAsset?.secureUrl || place.mediaAsset?.url;
                const locationStr = [place.city, place.state, place.country]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div
                    key={place.id}
                    className="group flex flex-col rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                  >
                    {/* Photo */}
                    <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden">
                      {photo ? (
                        <img
                          src={photo}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                          <MapPin className="w-10 h-10 mb-1" />
                          <span className="text-xs">Destination</span>
                        </div>
                      )}

                      <div className="absolute top-2.5 right-2.5">
                        <StatusBadge status={place.status} />
                      </div>

                      <div className="absolute top-2.5 left-2.5">
                        <PriorityBadge priority={place.priority} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground font-display">
                          {place.name}
                        </h3>
                        {locationStr && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{locationStr}</span>
                          </p>
                        )}

                        {place.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                            {place.description}
                          </p>
                        )}
                      </div>

                      {/* Budget and Target Date */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-border/50 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          {place.targetDate ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(place.targetDate)}
                            </span>
                          ) : (
                            <span>No date set</span>
                          )}

                          {place.estimatedBudget ? (
                            <span className="font-semibold text-foreground flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3" />
                              {formatCurrency(place.estimatedBudget)}
                            </span>
                          ) : null}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPlace(place);
                              setIsPlaceModalOpen(true);
                            }}
                            className="h-8 text-xs gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletePlaceId(place.id)}
                            className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<MapPin className="w-6 h-6" />}
              title="Your travel shelf is empty"
              description="Where in the world do you want to go? Add bucket list destinations and travel goals."
              actionLabel="Add Destination"
              onAction={() => {
                setEditingPlace(null);
                setIsPlaceModalOpen(true);
              }}
            />
          )}
        </>
      )}

      {/* Content for Trips Tab */}
      {isTripsTab && (
        <>
          {isLoadingTrips ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
          ) : isTripsError ? (
            <ErrorState
              title="Failed to load trips"
              message="Could not connect to the server."
              onRetry={() => refetchTrips()}
            />
          ) : tripsData?.data && tripsData.data.length > 0 ? (
            <div className="flex flex-col gap-5">
              {tripsData.data.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold font-display text-foreground">
                          {trip.name}
                        </h2>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {trip.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(trip.startDate)}
                            {trip.endDate && ` – ${formatDate(trip.endDate)}`}
                          </span>
                        )}
                        {trip.budget ? (
                          <span className="font-semibold text-foreground">
                            Budget: {formatCurrency(trip.budget)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddPlaceToTripTarget(trip);
                          setSelectedPlaceIdToAdd('');
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Destination
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingTrip(trip);
                          setIsTripModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTripId(trip.id)}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {trip.description}
                    </p>
                  )}

                  {/* Destinations Route Itinerary */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Destinations & Stops
                    </span>
                    {trip.tripPlaces && trip.tripPlaces.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {trip.tripPlaces
                          .sort((a, b) => a.order - b.order)
                          .map((tp, idx) => (
                            <div
                              key={tp.id}
                              className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <span className="font-semibold text-foreground block truncate">
                                    {tp.place?.name}
                                  </span>
                                  {tp.place?.country && (
                                    <span className="text-[10px] text-muted-foreground block truncate">
                                      {tp.place.country}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removePlaceFromTripMutation.mutate({
                                    tripId: trip.id,
                                    placeId: tp.placeId,
                                  })
                                }
                                className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors ml-2"
                                title="Remove destination from trip"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic bg-secondary/20 p-3 rounded-xl border border-dashed border-border/60">
                        No destinations added yet. Click &quot;Add Destination&quot; to link places to this trip.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Navigation className="w-6 h-6" />}
              title="No trips planned yet"
              description="Group your favorite travel destinations into complete multi-day itineraries."
              actionLabel="Create Trip"
              onAction={() => {
                setEditingTrip(null);
                setIsTripModalOpen(true);
              }}
            />
          )}
        </>
      )}

      {/* Place Form Modal */}
      <PlaceFormModal
        isOpen={isPlaceModalOpen}
        onClose={() => {
          setIsPlaceModalOpen(false);
          setEditingPlace(null);
          setSearchParams({});
        }}
        onSubmit={(values) => {
          if (editingPlace) {
            updatePlaceMutation.mutate({ id: editingPlace.id, values });
          } else {
            createPlaceMutation.mutate(values);
          }
        }}
        initialData={editingPlace}
        isLoading={createPlaceMutation.isPending || updatePlaceMutation.isPending}
      />

      {/* Trip Form Modal */}
      <TripFormModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSubmit={(values) => {
          if (editingTrip) {
            updateTripMutation.mutate({ id: editingTrip.id, values });
          } else {
            createTripMutation.mutate(values);
          }
        }}
        initialData={editingTrip}
        isLoading={createTripMutation.isPending || updateTripMutation.isPending}
      />

      {/* Add Place to Trip Modal */}
      <Dialog
        isOpen={!!addPlaceToTripTarget}
        onClose={() => setAddPlaceToTripTarget(null)}
        title="Add Place to Trip"
        description={`Select a destination to add to "${addPlaceToTripTarget?.name}"`}
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (addPlaceToTripTarget && selectedPlaceIdToAdd) {
              addPlaceToTripMutation.mutate({
                tripId: addPlaceToTripTarget.id,
                placeId: selectedPlaceIdToAdd,
              });
            }
          }}
          className="flex flex-col gap-4"
        >
          <Select
            label="Select Destination"
            value={selectedPlaceIdToAdd}
            onChange={(e) => setSelectedPlaceIdToAdd(e.target.value)}
            required
          >
            <option value="">-- Choose a Place from your shelf --</option>
            {allPlacesData?.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.country ? `(${p.country})` : ''}
              </option>
            ))}
          </Select>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddPlaceToTripTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedPlaceIdToAdd}
              isLoading={addPlaceToTripMutation.isPending}
            >
              Add to Itinerary
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Place Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePlaceId}
        onClose={() => setDeletePlaceId(null)}
        onConfirm={() => deletePlaceId && deletePlaceMutation.mutate(deletePlaceId)}
        title="Delete Destination?"
        description="This place will be permanently removed from your LifeShelf."
        confirmLabel="Delete Place"
        isLoading={deletePlaceMutation.isPending}
      />

      {/* Delete Trip Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTripId}
        onClose={() => setDeleteTripId(null)}
        onConfirm={() => deleteTripId && deleteTripMutation.mutate(deleteTripId)}
        title="Delete Trip Itinerary?"
        description="This trip plan will be removed from your LifeShelf."
        confirmLabel="Delete Trip"
        isLoading={deleteTripMutation.isPending}
      />
    </div>
  );
}
