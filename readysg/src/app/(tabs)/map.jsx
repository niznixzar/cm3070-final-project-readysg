import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Linking, Modal, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, HelperText, IconButton, SegmentedButtons, useTheme } from 'react-native-paper';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useAlerts } from '../../context/AlertsContext';
import LeafletMap, { RESOURCE_TYPES } from '../../components/LeafletMap';
import { AppHeader, T, H, Button, ChipRow, Field, Card, Screen } from '../../components/ui';
import { distanceKm, formatDistance, getCurrentLocation } from '../../lib/geo';
import { loadJSON, saveJSON, keys } from '../../lib/storage';
import { space } from '../../theme';

function AddResourceModal({ visible, point, onClose, onSaved, me }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [type, setType] = useState('aed');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(point);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setLocation(point);
      setError('');
    }
  }, [visible, point]);

  const save = async () => {
    if (!name.trim()) return setError('Describe where it is, e.g. "Blk 123 lift lobby".');
    if (!location) return setError('Tap the map to place the pin, or use your current location.');
    setBusy(true);
    try {
      // These fields must match what firestore.rules allows.
      await addDoc(collection(db, 'resources'), {
        type,
        name: name.trim().slice(0, 80),
        description: description.trim().slice(0, 300),
        lat: location.lat,
        lng: location.lng,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        verifiedBy: [],
        verifiedCount: 0,
        reportedBy: [],
        reportCount: 0,
      });
      setName('');
      setDescription('');
      onSaved();
    } catch (e) {
      setError(
        e?.code === 'permission-denied'
          ? 'That location is outside Singapore. Move the pin and try again.'
          : 'Could not save. Check your connection and try again.'
      );
    }
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen edges={['top', 'bottom']} contentStyle={{ paddingTop: space.xl }}>
          <H level={1}>Add a resource</H>
          <T variant="bodyBold">Type</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {Object.entries(RESOURCE_TYPES).map(([id, t]) => (
              <Chip key={id} selected={type === id} onPress={() => setType(id)}>{t.label}</Chip>
            ))}
          </View>
          <Field label="Where is it?" value={name} onChangeText={setName} placeholder="e.g. Blk 123 lift lobby" maxLength={80} />
          <Field
            label="Details (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. On the wall beside the letterboxes"
            maxLength={300}
            multiline
          />
          <T variant="small" style={{ color: location ? colors.success : colors.onSurfaceVariant }}>
            {location ? `Pin placed at ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'No pin placed yet.'}
          </T>
          <Button mode="outlined" icon="crosshairs-gps" onPress={async () => setLocation(me ?? (await getCurrentLocation()))}>
            Use my current location
          </Button>
          {error ? (
            <HelperText type="error" visible accessibilityRole="alert" style={{ fontSize: 16 }}>{error}</HelperText>
          ) : null}
          <Button mode="contained" onPress={save} loading={busy} disabled={busy}>Add to map</Button>
          <Button mode="outlined" onPress={onClose}>Cancel</Button>
        </Screen>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// One resource: name, distance, confirmations, and buttons unless compact.
function ResourceDetails({ resource, compact, onDirections, onConfirm, onReport }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const mine = resource.createdBy === user.uid;
  const confirmed = resource.verifiedBy?.includes(user.uid);
  const reported = resource.reportedBy?.includes(user.uid);
  const count = resource.verifiedCount;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
        <T variant="bodyBold" style={{ flex: 1 }}>{RESOURCE_TYPES[resource.type]?.label}: {resource.name}</T>
        {resource.distance != null ? (
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>{formatDistance(resource.distance)}</T>
        ) : null}
      </View>
      {resource.description && !compact ? <T variant="small">{resource.description}</T> : null}
      <T variant="smallBold" style={{ color: count ? colors.success : colors.onSurfaceVariant }}>
        {count ? `Confirmed by ${count} user${count > 1 ? 's' : ''}` : 'Not confirmed yet'}
        {resource.reportCount ? `. Reported by ${resource.reportCount}` : ''}
      </T>
      {!compact ? (
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Button mode="contained" icon="directions" onPress={onDirections} style={{ flexGrow: 1 }}>Directions</Button>
          {!mine && !confirmed ? (
            <Button mode="outlined" onPress={onConfirm} style={{ flexGrow: 1 }}>Confirm it's here</Button>
          ) : null}
          {!reported ? (
            <Button mode="outlined" onPress={onReport} style={{ flexGrow: 1 }}>Report a problem</Button>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

export default function MapScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { recordContribution } = useProgress();
  const { location } = useAlerts();
  const mapRef = useRef(null);

  const [resources, setResources] = useState([]);
  const [me, setMe] = useState(location);
  const [view, setView] = useState('map');
  const [filters, setFilters] = useState(Object.keys(RESOURCE_TYPES));
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draftPoint, setDraftPoint] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Saved copy first (works offline), then live updates.
  useEffect(() => {
    loadJSON(keys.resources, []).then((cached) => cached?.length && setResources(cached));
    const unsubscribe = onSnapshot(
      query(collection(db, 'resources'), limit(500)),
      (snap) => {
        const list = snap.docs.map((d) => {
          const { createdAt, ...rest } = d.data(); // Timestamps can't be saved as JSON
          return { id: d.id, ...rest };
        });
        setResources(list);
        saveJSON(keys.resources, list);
      },
      () => {} // offline: keep showing the saved copy
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (location) setMe(location);
    else getCurrentLocation().then(setMe);
  }, [location]);

  // Filtered, with distances, nearest first.
  const visible = useMemo(
    () =>
      resources
        .filter((r) => filters.includes(r.type))
        .map((r) => ({ ...r, distance: me ? distanceKm(me, r) : null }))
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
    [resources, filters, me]
  );

  const selected = visible.find((r) => r.id === selectedId);

  const toggleFilter = (id) =>
    setFilters(filters.includes(id) ? filters.filter((f) => f !== id) : [...filters, id]);

  const confirm = async (resource) => {
    try {
      await updateDoc(doc(db, 'resources', resource.id), { verifiedBy: arrayUnion(user.uid), verifiedCount: increment(1) });
      recordContribution('verify');
    } catch {
      Alert.alert('Could not confirm', 'Check your connection and try again.');
    }
  };

  const report = async (resource) => {
    try {
      await updateDoc(doc(db, 'resources', resource.id), { reportedBy: arrayUnion(user.uid), reportCount: increment(1) });
      Alert.alert('Thanks for reporting', 'Other users will see this location may be wrong.');
    } catch {
      Alert.alert('Could not report', 'Check your connection and try again.');
    }
  };

  const directions = (r) => {
    const url = Platform.OS === 'ios'
      ? `maps:?daddr=${r.lat},${r.lng}`
      : `geo:${r.lat},${r.lng}?q=${r.lat},${r.lng}(${encodeURIComponent(r.name)})`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`)
    );
  };

  const details = (r, compact) => (
    <ResourceDetails
      resource={r}
      compact={compact}
      onDirections={() => directions(r)}
      onConfirm={() => confirm(r)}
      onReport={() => report(r)}
    />
  );

  const openForm = (point) => {
    setDraftPoint(point);
    setFormOpen(true);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Resource map" />
      <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
        <SegmentedButtons
          value={view}
          onValueChange={setView}
          buttons={[
            { value: 'map', label: 'Map', icon: 'map' },
            { value: 'list', label: 'List', icon: 'format-list-bulleted' },
          ]}
        />
        <ChipRow label="Show resource types">
          {Object.entries(RESOURCE_TYPES).map(([id, t]) => (
            <Chip key={id} selected={filters.includes(id)} onPress={() => toggleFilter(id)}>{t.label}</Chip>
          ))}
        </ChipRow>
      </View>

      {view === 'map' ? (
        <View style={{ flex: 1, padding: space.xl, paddingTop: space.sm, gap: space.sm }}>
          {adding ? (
            <View style={{ backgroundColor: colors.emphasis, borderRadius: 12, padding: space.md }} accessibilityLiveRegion="polite">
              <T variant="bodyBold" style={{ color: '#ffffff' }}>Tap the map where the resource is.</T>
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <LeafletMap
              ref={mapRef}
              resources={visible}
              selectedId={selectedId}
              me={me}
              adding={adding}
              onSelect={setSelectedId}
              onPress={openForm}
            />
            <IconButton
              icon="crosshairs-gps"
              mode="contained-tonal"
              size={24}
              accessibilityLabel="Show my location on the map"
              onPress={() => (me ? mapRef.current?.centerOnMe() : getCurrentLocation().then(setMe))}
              style={{ position: 'absolute', right: 4, top: 4 }}
            />
          </View>
          {selected && !adding ? <Card>{details(selected)}</Card> : null}
          <Button
            mode={adding ? 'outlined' : 'contained'}
            icon={adding ? 'close' : 'plus'}
            onPress={() => {
              setAdding(!adding);
              setSelectedId(null);
            }}
          >
            {adding ? 'Cancel adding' : 'Add location'}
          </Button>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, gap: space.md }}
          ListHeaderComponent={
            <Button mode="contained" icon="plus" onPress={() => openForm(me)}>Add location</Button>
          }
          ListEmptyComponent={<T>No resources here yet. Be the first to add one.</T>}
          renderItem={({ item }) => <Card>{details(item)}</Card>}
        />
      )}

      <AddResourceModal
        visible={formOpen}
        point={draftPoint}
        me={me}
        onClose={() => {
          setFormOpen(false);
          setAdding(false);
        }}
        onSaved={() => {
          setFormOpen(false);
          setAdding(false);
          recordContribution('add');
          Alert.alert('Added to the map', 'Thanks. Other users can now confirm it.');
        }}
      />
    </SafeAreaView>
  );
}
