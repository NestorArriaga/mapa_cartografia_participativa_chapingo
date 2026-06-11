 
import { ParticipatorySubmission } from '../types/submissions';

export type ParticipatorySubmissionInput = Omit<ParticipatorySubmission, 'id' | 'createdAt' | 'status' | 'sensitiveFlags'>;

export type SubmissionProvider = {
  list(): Promise<ParticipatorySubmission[]>;
  create(input: ParticipatorySubmissionInput): Promise<ParticipatorySubmission>;
  updateStatus(id: string, status: ParticipatorySubmission["status"], reviewNotes?: string): Promise<ParticipatorySubmission>;
  remove(id: string): Promise<void>;
  exportJSON(): Promise<Blob>;
};

const LOCAL_STORAGE_KEY = 'mapavivo_submissions_v1';

export class LocalStorageSubmissionProvider implements SubmissionProvider {
  async list(): Promise<ParticipatorySubmission[]> {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async create(input: ParticipatorySubmissionInput): Promise<ParticipatorySubmission> {
    const list = await this.list();
    const newSub: ParticipatorySubmission = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'submitted' as any, // Will be overridden by moderation
      sensitiveFlags: []
    };
    list.push(newSub);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return newSub;
  }

  async updateStatus(id: string, status: ParticipatorySubmission["status"], reviewNotes?: string): Promise<ParticipatorySubmission> {
    const list = await this.list();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Submission not found');
    list[index].status = status;
    if (reviewNotes !== undefined) {
      list[index].reviewNotes = reviewNotes;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return list[index];
  }

  async remove(id: string): Promise<void> {
    const list = await this.list();
    const newList = list.filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
  }

  async exportJSON(): Promise<Blob> {
    const list = await this.list();
    return new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
  }
}

export class MockRemoteSubmissionProvider implements SubmissionProvider {
  async list(): Promise<ParticipatorySubmission[]> {
    console.log('[MockRemote] list');
    return [];
  }
  async create(input: ParticipatorySubmissionInput): Promise<ParticipatorySubmission> {
    console.log('[MockRemote] create', input);
    return { ...input, id: 'remote-1', createdAt: new Date().toISOString(), status: 'submitted', sensitiveFlags: [] };
  }
  async updateStatus(id: string, status: ParticipatorySubmission["status"], reviewNotes?: string): Promise<ParticipatorySubmission> {
    console.log('[MockRemote] updateStatus', id, status);
    return { id, status, reviewNotes, createdAt: new Date().toISOString() } as any;
  }
  async remove(id: string): Promise<void> {
    console.log('[MockRemote] remove', id);
  }
  async exportJSON(): Promise<Blob> {
    return new Blob(['[]'], { type: 'application/json' });
  }
}

// Global provider instance
export const submissionService: SubmissionProvider = new LocalStorageSubmissionProvider();
