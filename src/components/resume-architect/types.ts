export interface Education {
  school: string;
  degree: string;
  year: string;
  description: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    website?: string;
    profilePicture?: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  templateId: string;
  colorTheme: string;
}
