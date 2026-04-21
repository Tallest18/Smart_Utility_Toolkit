import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
};

const NOTE_COLORS = [
  '#2D1B69', // purple
  '#0F3D3E', // teal
  '#1D3557', // blue
  '#3D1F2D', // rose
  '#3D2C0A', // amber
  '#0D3321', // green
  '#1E293B', // default
];

const STORAGE_KEY = 'smart_notes_v1';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[6]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setNotes(JSON.parse(data));
    } catch (e) {
      console.error('Load notes error', e);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (updated: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Save notes error', e);
    }
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteColor(NOTE_COLORS[6]);
    setModalVisible(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      setModalVisible(false);
      return;
    }
    const now = Date.now();
    let updated: Note[];
    if (editingNote) {
      updated = notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, title: noteTitle, content: noteContent, color: noteColor, updatedAt: now }
          : n
      );
    } else {
      const newNote: Note = {
        id: generateId(),
        title: noteTitle || 'Untitled',
        content: noteContent,
        color: noteColor,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
      };
      updated = [newNote, ...notes];
    }
    setNotes(updated);
    saveNotes(updated);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = notes.filter((n) => n.id !== id);
          setNotes(updated);
          saveNotes(updated);
        },
      },
    ]);
  };

  const handlePin = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const renderNote = (note: Note) => (
    <TouchableOpacity
      key={note.id}
      style={[styles.noteCard, { backgroundColor: note.color }]}
      onPress={() => openEditNote(note)}
      onLongPress={() => handleDelete(note.id)}
      activeOpacity={0.85}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title || 'Untitled'}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => handlePin(note.id)} style={styles.noteAction}>
            <Ionicons
              name={note.isPinned ? 'pin' : 'pin-outline'}
              size={16}
              color={note.isPinned ? Colors.warning : 'rgba(255,255,255,0.4)'}
            />
          </TouchableOpacity>
        </View>
      </View>
      {note.content ? (
        <Text style={styles.notePreview} numberOfLines={3}>
          {note.content}
        </Text>
      ) : null}
      <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Notes</Text>
          <Text style={styles.headerSub}>{notes.length} notes</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openNewNote}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySub}>Tap the + button to create your first note</Text>
          </View>
        ) : (
          <View style={styles.notesContent}>
            {pinnedNotes.length > 0 && (
              <>
                <Text style={styles.groupLabel}>
                  <Ionicons name="pin" size={12} color={Colors.warning} /> Pinned
                </Text>
                <View style={styles.notesGrid}>
                  {pinnedNotes.map(renderNote)}
                </View>
              </>
            )}
            {unpinnedNotes.length > 0 && (
              <>
                {pinnedNotes.length > 0 && (
                  <Text style={styles.groupLabel}>Others</Text>
                )}
                <View style={styles.notesGrid}>
                  {unpinnedNotes.map(renderNote)}
                </View>
              </>
            )}
            {filteredNotes.length === 0 && searchQuery ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySub}>Try a different search term</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Edit/Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalSheet, { backgroundColor: noteColor }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Note' : 'New Note'}
              </Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Color Picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorScroll}
              contentContainerStyle={styles.colorContent}
            >
              {NOTE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    noteColor === c && styles.colorDotActive,
                  ]}
                  onPress={() => setNoteColor(c)}
                />
              ))}
            </ScrollView>

            {/* Title */}
            <TextInput
              style={styles.titleInput}
              placeholder="Note title..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={noteTitle}
              onChangeText={setNoteTitle}
              maxLength={100}
            />

            {/* Content */}
            <TextInput
              style={styles.contentInput}
              placeholder="Start writing your note..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  notesContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
  },
  groupLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  noteCard: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 130,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  noteTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 4,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 4,
  },
  noteAction: {
    padding: 2,
  },
  notePreview: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
    flex: 1,
  },
  noteDate: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: height * 0.7,
    maxHeight: height * 0.92,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  saveBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  colorScroll: {
    marginBottom: Spacing.md,
  },
  colorContent: {
    gap: 8,
    paddingVertical: 4,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: Colors.white,
    transform: [{ scale: 1.2 }],
  },
  titleInput: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
    paddingVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    minHeight: 200,
  },
});
