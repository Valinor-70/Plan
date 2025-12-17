import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject } from '../types';
import { generateId } from '../utils/generateId';

interface SubjectState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
}

interface SubjectActions {
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  archiveSubject: (id: string) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getActiveSubjects: () => Subject[];
  getArchivedSubjects: () => Subject[];
}

type SubjectStore = SubjectState & SubjectActions;

export const useSubjectStore = create<SubjectStore>()(
  persist(
    (set, get) => ({
      subjects: [],
      loading: false,
      error: null,

      addSubject: (subjectData) => {
        const newSubject: Subject = {
          ...subjectData,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({ subjects: [...state.subjects, newSubject] }));
      },

      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, ...updates } : subject
          ),
        }));
      },

      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== id),
        }));
      },

      archiveSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, archived: true } : subject
          ),
        }));
      },

      getSubjectById: (id) => {
        return get().subjects.find((subject) => subject.id === id);
      },

      getActiveSubjects: () => {
        return get().subjects.filter((subject) => !subject.archived);
      },

      getArchivedSubjects: () => {
        return get().subjects.filter((subject) => subject.archived);
      },
    }),
    {
      name: 'homework-planner-subjects',
      partialize: (state) => ({ subjects: state.subjects }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.subjects = state.subjects.map((subject) => ({
            ...subject,
            createdAt: new Date(subject.createdAt),
          }));
        }
      },
    }
  )
);
