import { apiGet, apiPost } from "./client";

export type MusicSearchResult = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
};

export type LyricsDetail = {
  id: number;
  trackName: string;
  artistName: string;
  plainLyrics: string;
  syncedLyrics: string | null;
};

export async function searchLyrics(query: string): Promise<MusicSearchResult[]> {
  return apiGet<MusicSearchResult[]>(`/api/v1/lyrics/search?q=${encodeURIComponent(query)}`);
}

export async function getLyrics(id: number): Promise<LyricsDetail> {
  return apiGet<LyricsDetail>(`/api/v1/lyrics/${id}`);
}

export async function generateVocab(musicId: number): Promise<void> {
  await apiPost<unknown>(`/api/v1/vocab/generate/${musicId}`);
}
