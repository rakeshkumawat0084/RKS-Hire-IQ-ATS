import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: any | null;
  isAdmin: boolean;
  token: string | null;
  setUser: (user: any, token?: string) => void;
  setAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      token: null,
      setUser: (user, token) => {
        if (token) localStorage.setItem('token', token);
        if (user?.preferredModel) localStorage.setItem('rks-preferred-ai-model', user.preferredModel);
        set({ user, token: token || localStorage.getItem('token'), isAdmin: user?.isAdmin || false });
      },
      setAdmin: (isAdmin) => set({ isAdmin }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAdmin: false, token: null });
      },
    }),
    {
      name: 'rks-user-storage',
    }
  )
);

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

// ─── Global Resume Pipeline Store ─────────────────────────────────────────────
// Shared across ALL features: ResumeAnalyzer, SkillsLab, CareerPath, MockInterview
// When the user finalizes a resume in ResumeMaker, all features auto-populate.
interface ResumeStore {
  resumeText: string;          // plain text of the latest resume (for AI context)
  resumeRole: string;          // detected job role / target position
  resumeSkills: string;        // comma-separated skills from resume
  resumeEducation: string;     // education summary
  hasResume: boolean;
  setResumeData: (text: string, role?: string, skills?: string, education?: string) => void;
  clearResume: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumeText: '',
      resumeRole: '',
      resumeSkills: '',
      resumeEducation: '',
      hasResume: false,
      setResumeData: (text, role = '', skills = '', education = '') =>
        set({ resumeText: text, resumeRole: role, resumeSkills: skills, resumeEducation: education, hasResume: !!text }),
      clearResume: () =>
        set({ resumeText: '', resumeRole: '', resumeSkills: '', resumeEducation: '', hasResume: false }),
    }),
    { name: 'rks-resume-pipeline' }
  )
);
