export interface LanguageResponse {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isActive: boolean;
}

export interface AudioResponse {
  id: number;
  format: string;
  typeAudio: string;
  speakerUuid: string;
  speakerName: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  fileSizeInBytes: number;
  fileSizeFormatted: string;
  hasAudioFile: boolean;
  title?: string;
  description?: string;
  audioFile?: any;
}

export interface VoixResponse {
  id: number;
  name: string;
  description: string;
  type: string;
  accent: string;
  languageCode: string;
  isActive: boolean;
  rating: number;
  usageCount: number;
}

export interface SpeakerProfileResponse {
  uuid: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  phone: string;
  code: string;
  role: string;
  age: number;
  gender: string;
  earnings: number;
  banckRib: string;
  paymentemail: string;
  activeTextValidation: boolean;
  languages: LanguageResponse[];
  voix: VoixResponse[];
  audios: AudioResponse[];
  totalAudios: number;
  totalVoices: number;
  totalLanguages: number;
  averageRating: number;
  completedProjects: number;
  isActive: boolean;
  isDeleted: boolean;
  profileCompletionStatus: string;
  isAvailableForNewProjects: boolean;
  preferredWorkingHours: string;
  specializations: string[];
  avatar?: string;
}
