 
import { create } from 'zustand';
import { ParticipatorySubmission } from '../types/submissions';

const STORAGE_KEY = 'ecoFemSubmissions';

function readStorage(): ParticipatorySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(submissions: ParticipatorySubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('[submissionStore] Failed to write to localStorage:', err);
  }
}

interface SubmissionState {
  submissions: ParticipatorySubmission[];
  getSubmissions: () => ParticipatorySubmission[];
  getLocalSubmissionsCount: () => number;
  saveSubmission: (submission: ParticipatorySubmission) => void;
  deleteSubmissionLocal: (id: string) => void;
  exportSubmissionsJSON: () => string;
  clearLocalSubmissions: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: readStorage(),

  getSubmissions: () => get().submissions,

  getLocalSubmissionsCount: () => get().submissions.length,

  saveSubmission: (submission) => {
    set((state) => {
      const newSubmissions = [...state.submissions, submission];
      writeStorage(newSubmissions);
      return { submissions: newSubmissions };
    });
  },

  deleteSubmissionLocal: (id) => {
    set((state) => {
      const newSubmissions = state.submissions.filter((s) => s.id !== id);
      writeStorage(newSubmissions);
      return { submissions: newSubmissions };
    });
  },

  exportSubmissionsJSON: () => {
    const data = get().submissions;
    return JSON.stringify(data, null, 2);
  },

  clearLocalSubmissions: () => {
    writeStorage([]);
    set({ submissions: [] });
  },
}));
