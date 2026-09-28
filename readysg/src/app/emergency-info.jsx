import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Share, View } from 'react-native';
import { Icon, SegmentedButtons, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Screen, AppHeader, T, H, Card, Button, Field, CallButton } from '../components/ui';
import { loadEmergencyInfo, saveEmergencyInfo, emptyInfo, emptyPerson, shareText } from '../lib/emergencyInfo';
import { space } from '../theme';

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'relationship', label: 'Relationship', notForMe: true },
  { key: 'bloodType', label: 'Blood type', placeholder: 'e.g. O+' },
  { key: 'allergies', label: 'Allergies', placeholder: 'e.g. Penicillin' },
  { key: 'conditions', label: 'Medical conditions', placeholder: 'e.g. Asthma' },
  { key: 'medication', label: 'Medication' },
  { key: 'contactName', label: 'Emergency contact name' },
  { key: 'contactPhone', label: 'Emergency contact phone', keyboardType: 'phone-pad' },
];

function PersonCard({ person, isMe, onEdit, onDelete }) {
  const { colors } = useTheme();
  const rows = FIELDS.filter((f) => f.key !== 'name' && !(isMe && f.notForMe));

  return (
    <Card>
      <H>{isMe ? 'My emergency card' : person.name || 'Unnamed'}</H>
      {rows.map((f) => (
        <View
          key={f.key}
          accessible
          accessibilityLabel={`${f.label}: ${person[f.key] || 'not set'}`}
          style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}
        >
          <T variant="small" style={{ color: colors.onSurfaceVariant }}>{f.label}</T>
          <T variant="bodyBold">{person[f.key] || 'Not set'}</T>
        </View>
      ))}
      {isMe && person.name ? <T variant="small" style={{ color: colors.onSurfaceVariant }}>Name: {person.name}</T> : null}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {isMe ? (
          <Button mode="contained" icon="share-variant" onPress={() => Share.share({ message: shareText(person) })} style={{ flexGrow: 1 }}>
            Share my card
          </Button>
        ) : null}
        <Button mode="outlined" onPress={onEdit} style={{ flexGrow: 1 }}>Edit</Button>
        {!isMe ? <Button mode="outlined" onPress={onDelete} style={{ flexGrow: 1 }}>Remove</Button> : null}
      </View>
    </Card>
  );
}

function EditModal({ visible, person, isMe, onSave, onClose }) {
  const [draft, setDraft] = useState(person);
  useEffect(() => setDraft(person), [person]);
  if (!draft) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen edges={['top', 'bottom']} contentStyle={{ paddingTop: space.xl }}>
          <H level={1}>{isMe ? 'Edit my card' : 'Edit person'}</H>
          {FIELDS.filter((f) => !(isMe && f.notForMe)).map((f) => (
            <Field
              key={f.key}
              label={f.label}
              value={draft[f.key]}
              placeholder={f.placeholder}
              keyboardType={f.keyboardType}
              onChangeText={(value) => setDraft({ ...draft, [f.key]: value })}
            />
          ))}
          <Button mode="contained" onPress={() => onSave(draft)}>Save</Button>
          <Button mode="outlined" onPress={onClose}>Cancel</Button>
        </Screen>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function EmergencyInfo() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [info, setInfo] = useState(emptyInfo());
  const [tab, setTab] = useState('me');
  const [editing, setEditing] = useState(null); // { group, person }

  useEffect(() => {
    loadEmergencyInfo(user.uid).then(setInfo);
  }, [user.uid]);

  const save = async (next) => setInfo(await saveEmergencyInfo(user.uid, next));

  const savePerson = (person) => {
    const { group } = editing;
    if (group === 'me') {
      save({ ...info, me: person });
    } else {
      const exists = info[group].some((p) => p.id === person.id);
      const list = exists ? info[group].map((p) => (p.id === person.id ? person : p)) : [...info[group], person];
      save({ ...info, [group]: list });
    }
    setEditing(null);
  };

  const remove = (group, person) =>
    Alert.alert('Remove this person?', `${person.name || 'This person'} will be removed from your emergency info.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => save({ ...info, [group]: info[group].filter((p) => p.id !== person.id) }) },
    ]);

  return (
    <Screen header={<AppHeader back="Back" />}>
      <H level={1}>Emergency info</H>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon source="check-circle" size={18} color={colors.success} />
        <T variant="smallBold" style={{ color: colors.success }}>Saved on this device. Works offline.</T>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <CallButton number="995" label="Fire, ambulance" primary />
        <CallButton number="999" label="Police" />
        <CallButton number="1777" label="Non-emergency ambulance" />
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'me', label: 'Me' },
          { value: 'family', label: `Family (${info.family.length})` },
          { value: 'friends', label: `Friends (${info.friends.length})` },
        ]}
      />

      {tab === 'me' ? (
        <PersonCard person={info.me} isMe onEdit={() => setEditing({ group: 'me', person: info.me })} />
      ) : (
        <>
          {info[tab].length === 0 ? (
            <T>No one added yet. Add the people you would need to help in an emergency.</T>
          ) : (
            info[tab].map((p) => (
              <PersonCard key={p.id} person={p} onEdit={() => setEditing({ group: tab, person: p })} onDelete={() => remove(tab, p)} />
            ))
          )}
          <Button mode="contained" icon="plus" onPress={() => setEditing({ group: tab, person: emptyPerson() })}>
            {tab === 'family' ? 'Add family member' : 'Add friend'}
          </Button>
        </>
      )}

      <T variant="small" style={{ color: colors.onSurfaceVariant }}>
        Sharing sends only your own card. Family and friends' details are never included.
      </T>

      <EditModal
        visible={!!editing}
        person={editing?.person}
        isMe={editing?.group === 'me'}
        onSave={savePerson}
        onClose={() => setEditing(null)}
      />
    </Screen>
  );
}
