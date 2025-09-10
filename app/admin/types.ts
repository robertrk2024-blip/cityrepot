export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: string;
  location_text: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
  photos_count: number; // ✅ ajouté pour correspondre à lib/storage.ts
}

