export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: string;
  location_text: string;
  priority: string;
  status: "nouveau" | "en_cours" | "resolu"; // ✅ uniformisé sans accent
  created_at: string;
  updated_at?: string;
  photos_count: number;
}
