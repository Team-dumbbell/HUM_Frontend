import { create } from "zustand";
import { apiGet } from "../api/client";
import { readProfileFromStoredToken, type TokenProfile } from "../auth/tokenProfile";
import dummyData from "../data/dummy.json";

type SortType = "latest" | "frequency" | "alphabet";
type TrackSortType = "latest" | "title" | "words";
type Language = "ALL" | "ENGLISH" | "JAPANESE" | "KOREAN";
type Platform = "youtube" | "spotify" | "apple";
type PlatformFilter = "ALL" | "YOUTUBE" | "SPOTIFY" | "APPLE";

type WordItem = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  artist: string;
  song: string;
  frequency: number;
  addedAt: string;
  language: Exclude<Language, "ALL">;
  synonyms?: string[];
};

type TrackItem = {
  id: number;
  title: string;
  artist: string;
  capturedAt: string;
  extractedWords: number;
  source: string;
  platform: Platform;
  coverStart: string;
  coverEnd: string;
};

type DashboardData = {
  greetingName: string;
  totalWords: number;
  totalTracks: number;
};

type UserData = {
  name: string;
  avatarText: string;
};

type ProfileData = {
  email: string;
  level: string;
  streakDays: number;
  favoriteLanguage: string;
  totalCapturedWords: number;
  totalCapturedTracks: number;
};

type WordStore = {
  wordList: WordItem[];
  trackList: TrackItem[];
  dashboard: DashboardData;
  user: UserData;
  profile: ProfileData;

  query: string;
  sortType: SortType;
  language: Language;
  trackPlatformFilter: PlatformFilter;
  trackSortType: TrackSortType;

  setQuery: (v: string) => void;
  setSortType: (v: SortType) => void;
  setLanguage: (v: Language) => void;
  setTrackPlatformFilter: (v: PlatformFilter) => void;
  setTrackSortType: (v: TrackSortType | ((prev: TrackSortType) => TrackSortType)) => void;

  fetchAppData: () => Promise<void>;

  getFilteredWords: () => WordItem[];
  getFilteredTracks: (queryText: string) => TrackItem[];
  getDashboardRecentWords: (count?: number) => WordItem[];
  getDashboardRecentTracks: (count?: number) => TrackItem[];
};

let appDataRequest: Promise<void> | null = null;

export const useWordStore = create<WordStore>((set, get) => ({
  wordList: [],
  trackList: [],
  dashboard: {
    greetingName: "HUM User",
    totalWords: 0,
    totalTracks: 0,
  },
  user: {
    name: "HUM User",
    avatarText: "H",
  },
  profile: {
    email: "",
    level: "Beginner",
    streakDays: 0,
    favoriteLanguage: "ENGLISH",
    totalCapturedWords: 0,
    totalCapturedTracks: 0,
  },

  query: "",
  sortType: "latest",
  language: "ALL",
  trackPlatformFilter: "ALL",
  trackSortType: "latest",

  setQuery: (v) => set({ query: v }),
  setSortType: (v) => set({ sortType: v }),
  setLanguage: (v) => set({ language: v }),
  setTrackPlatformFilter: (v) => set({ trackPlatformFilter: v }),
  setTrackSortType: (v) =>
    set((state) => ({
      trackSortType:
        typeof v === "function"
          ? (v as (prev: TrackSortType) => TrackSortType)(state.trackSortType)
          : v,
    })),

  fetchAppData: async () => {
    if (appDataRequest) {
      await appDataRequest;
      return;
    }

    appDataRequest = (async () => {
      const tokenProfile = readProfileFromStoredToken();
      let hasSuccessfulResponse = false;

      const profilePromise = safeApiGet("/user/profile");
      const vocabularyPromise = safeApiGet("/vocabulary/lists");
      const historyPromise = safeApiGet("/music/history");
      const wordsPromise = safeApiGet("/user/words");

      const profileTask = profilePromise.then((profileRes) => {
        if (!profileRes) return;
        hasSuccessfulResponse = true;

        const profilePayload = unwrapObject(profileRes);
        const profileDataRow = unwrapObject(profilePayload.data ?? {});
        const usersRow = unwrapObject(
          profilePayload.users ??
            profilePayload.user ??
            profilePayload.user_profile ??
            profileDataRow,
        );
        const settingsRow = unwrapObject(
          profileDataRow.settings ??
            profilePayload.user_vocabulary_settings ??
            profilePayload.settings ??
            null,
        );

        const apiName = readString(
          usersRow.display_name ?? usersRow.name ?? usersRow.nickname ?? usersRow.username,
          "",
        );
        const displayName = pickDisplayName(apiName, tokenProfile);

        set((state) => ({
          dashboard: {
            ...state.dashboard,
            greetingName: displayName,
          },
          user: {
            ...state.user,
            name: displayName,
            avatarText: displayName.charAt(0).toUpperCase() || tokenProfile?.avatarText || "H",
          },
          profile: {
            ...state.profile,
            email: readString(usersRow.email, tokenProfile?.email || ""),
            level: readString(settingsRow.level, "Beginner"),
            streakDays: readNumber(settingsRow.streak_days ?? settingsRow.streakDays, 0),
            favoriteLanguage: readString(settingsRow.favorite_language ?? settingsRow.language, "ENGLISH"),
          },
        }));
      });

      const wordsTask = wordsPromise.then((wordsRes) => {
        if (!wordsRes) return;
        hasSuccessfulResponse = true;

        const wordsPayload = unwrapObject(wordsRes);
        const userWordsRows = unwrapArray(wordsPayload.user_words ?? wordsPayload.data ?? wordsRes ?? []);
        const synonymRows = unwrapArray(wordsPayload.word_synonyms ?? []);
        const synonymsByWord = buildSynonymMap(synonymRows);

        const words = userWordsRows.map((item, index) => {
          const row = unwrapObject(item);
          const word = readString(row.word ?? row.term ?? row.text, `word-${index + 1}`);
          const mappedSynonyms =
            readStringArray(row.synonyms) ??
            synonymsByWord.get(String(row.id ?? row.word_id ?? word)) ??
            [];

          return {
            id: readNumber(row.id ?? row.word_id, index + 1),
            word,
            meaning: readString(row.meaning ?? row.definition ?? row.translation, "-"),
            partOfSpeech: readString(row.part_of_speech ?? row.partOfSpeech ?? row.pos, "기타"),
            artist: readString(row.artist ?? row.song_artist, "-"),
            song: readString(
              row.song ?? row.song_title ?? row.track_title ?? row.music_title,
              "-",
            ),
            frequency: readNumber(row.frequency ?? row.count ?? row.capture_count, 1),
            addedAt: formatDateLabel(row.created_at ?? row.added_at ?? row.updated_at),
            language: parseLanguage(row.language ?? row.lang),
            synonyms: mappedSynonyms,
          } satisfies WordItem;
        });

        set((state) => ({
          wordList: words,
          dashboard: {
            ...state.dashboard,
            totalWords: words.length,
          },
          profile: {
            ...state.profile,
            totalCapturedWords: words.length,
          },
        }));
      });

      const historyTask = historyPromise.then((historyRes) => {
        if (!historyRes) return;
        hasSuccessfulResponse = true;

        const historyPayload = unwrapObject(historyRes);
        const historyRows = unwrapArray(
          historyPayload.user_music_history ?? historyPayload.data ?? historyRes ?? [],
        );

        const tracks = historyRows.map((item, index) => {
          const row = unwrapObject(item);
          const platform = parsePlatform(row.platform ?? row.source_platform ?? row.channel);
          const colors = pickCoverColors(index, platform);

          return {
            id: readNumber(row.id ?? row.history_id ?? row.track_id, index + 1),
            title: readString(
              row.title ?? row.song_title ?? row.track_title ?? row.song,
              `Track ${index + 1}`,
            ),
            artist: readString(
              row.artist ?? row.song_artist ?? row.track_artist,
              "Unknown Artist",
            ),
            capturedAt: formatDateTimeLabel(row.created_at ?? row.captured_at ?? row.updated_at),
            extractedWords: readNumber(row.extracted_words ?? row.word_count, 0),
            source: readString(row.source_url ?? row.source ?? row.url, "#"),
            platform,
            coverStart: colors[0],
            coverEnd: colors[1],
          } satisfies TrackItem;
        });

        set((state) => ({
          trackList: tracks,
          dashboard: {
            ...state.dashboard,
            totalTracks: tracks.length,
          },
          profile: {
            ...state.profile,
            totalCapturedTracks: tracks.length,
          },
        }));
      });

      const vocabularyTask = vocabularyPromise.then((vocabularyRes) => {
        if (!vocabularyRes) return;
        hasSuccessfulResponse = true;

        const vocabularyPayload = unwrapObject(vocabularyRes);
        const vocabularyLists = unwrapArray(
          vocabularyPayload.vocabulary_lists ?? vocabularyPayload.data ?? vocabularyRes ?? [],
        );
        const fallbackWordCount = countEntriesFromVocabularyLists(vocabularyLists);
        if (fallbackWordCount <= 0) return;

        set((state) => {
          if (state.wordList.length > 0) {
            return {};
          }
          return {
            dashboard: {
              ...state.dashboard,
              totalWords: fallbackWordCount,
            },
            profile: {
              ...state.profile,
              totalCapturedWords: fallbackWordCount,
            },
          };
        });
      });

      await Promise.allSettled([profileTask, wordsTask, historyTask, vocabularyTask]);

      if (!hasSuccessfulResponse) {
        applyDummyData(set, tokenProfile);
      }
    })().finally(() => {
      appDataRequest = null;
    });

    await appDataRequest;
  },
  getFilteredWords: () => {
    const { wordList, query, sortType, language } = get();

    const normalized = query.trim().toLowerCase();

    let filtered = normalized
      ? wordList.filter(
          (item) =>
            item.word.toLowerCase().includes(normalized) ||
            item.meaning.toLowerCase().includes(normalized) ||
            item.artist.toLowerCase().includes(normalized),
        )
      : wordList;

    if (language !== "ALL") {
      filtered = filtered.filter((item) => item.language === language);
    }

    if (sortType === "alphabet") {
      return [...filtered].sort((a, b) => a.word.localeCompare(b.word));
    }
    if (sortType === "frequency") {
      return [...filtered].sort((a, b) => b.frequency - a.frequency);
    }

    return [...filtered].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  },

  getFilteredTracks: (queryText) => {
    const { trackList, trackPlatformFilter, trackSortType } = get();
    const normalized = queryText.trim().toLowerCase();

    let filtered = normalized
      ? trackList.filter(
          (track) =>
            track.title.toLowerCase().includes(normalized) ||
            track.artist.toLowerCase().includes(normalized),
        )
      : trackList;

    if (trackPlatformFilter !== "ALL") {
      filtered = filtered.filter((track) => {
        if (trackPlatformFilter === "YOUTUBE") return track.platform === "youtube";
        if (trackPlatformFilter === "SPOTIFY") return track.platform === "spotify";
        return track.platform === "apple";
      });
    }

    if (trackSortType === "title") {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (trackSortType === "words") {
      return [...filtered].sort((a, b) => b.extractedWords - a.extractedWords);
    }

    return [...filtered].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  },

  getDashboardRecentWords: (count = 3) => {
    const { wordList } = get();
    return [...wordList]
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .slice(0, count);
  },

  getDashboardRecentTracks: (count = 3) => {
    const { trackList } = get();
    return [...trackList]
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
      .slice(0, count);
  },
}));

function applyDummyData(
  set: (partial: Partial<WordStore> | ((state: WordStore) => Partial<WordStore>), replace?: false) => void,
  tokenProfile: TokenProfile | null,
) {
  const words = (dummyData.words as WordItem[]) ?? [];
  const tracks = ((dummyData as { tracks?: TrackItem[] }).tracks ?? []) as TrackItem[];
  const dashboard =
    ((dummyData as { dashboard?: DashboardData }).dashboard as DashboardData | undefined) ?? {
      greetingName: "HUM User",
      totalWords: words.length,
      totalTracks: tracks.length,
    };
  const user =
    ((dummyData as { user?: UserData }).user as UserData | undefined) ?? {
      name: "HUM User",
      avatarText: "H",
    };
  const profile =
    ((dummyData as { profile?: ProfileData }).profile as ProfileData | undefined) ?? {
      email: "",
      level: "Beginner",
      streakDays: 0,
      favoriteLanguage: "ENGLISH",
      totalCapturedWords: words.length,
      totalCapturedTracks: tracks.length,
    };
  const dummyName = pickDisplayName(user.name || dashboard.greetingName || "", tokenProfile);
  const mergedName = dummyName || tokenProfile?.name || "HUM User";
  const mergedAvatar = tokenProfile?.avatarText || mergedName.charAt(0).toUpperCase() || "H";
  const mergedEmail = isPlaceholderEmail(profile.email) ? tokenProfile?.email || "" : profile.email || tokenProfile?.email || "";

  set({
    wordList: words,
    trackList: tracks,
    dashboard: {
      ...dashboard,
      greetingName: mergedName,
      totalWords: dashboard.totalWords || words.length,
      totalTracks: dashboard.totalTracks || tracks.length,
    },
    user: {
      ...user,
      name: mergedName,
      avatarText: mergedAvatar,
    },
    profile: {
      ...profile,
      email: mergedEmail,
      totalCapturedWords: profile.totalCapturedWords || words.length,
      totalCapturedTracks: profile.totalCapturedTracks || tracks.length,
    },
  });
}

function unwrapObject(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function unwrapArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

async function safeApiGet(path: string) {
  try {
    return await apiGet<unknown>(path);
  } catch {
    return null;
  }
}

function readString(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function readNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map((item) => readString(item, "")).filter(Boolean);
}

function parseLanguage(value: unknown): Exclude<Language, "ALL"> {
  const normalized = readString(value, "ENGLISH").toUpperCase();
  if (normalized.startsWith("KO")) {
    return "KOREAN";
  }
  if (normalized.startsWith("JA")) {
    return "JAPANESE";
  }
  return "ENGLISH";
}

function parsePlatform(value: unknown): Platform {
  const normalized = readString(value, "youtube").toLowerCase();
  if (normalized.includes("spotify")) {
    return "spotify";
  }
  if (normalized.includes("apple")) {
    return "apple";
  }
  return "youtube";
}

function formatDateLabel(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

function formatDateTimeLabel(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function countEntriesFromVocabularyLists(items: unknown[]) {
  return items.reduce<number>((count, item) => {
    const row = unwrapObject(item);
    if (Array.isArray(row.entries)) {
      return count + row.entries.length;
    }
    return count;
  }, 0);
}

function buildSynonymMap(items: unknown[]) {
  const map = new Map<string, string[]>();

  for (const item of items) {
    const row = unwrapObject(item);
    const key = String(row.word_id ?? row.word ?? "");
    if (!key) {
      continue;
    }

    const rawSynonyms =
      readStringArray(row.synonyms) ?? [readString(row.synonym ?? row.term, "")].filter(Boolean);
    if (rawSynonyms.length === 0) {
      continue;
    }

    const current = map.get(key) ?? [];
    map.set(key, [...current, ...rawSynonyms]);
  }

  return map;
}

function pickCoverColors(index: number, platform: Platform): [string, string] {
  const paletteByPlatform: Record<Platform, [string, string][]> = {
    youtube: [
      ["#ff6b6b", "#f06595"],
      ["#ff8a00", "#ff3d00"],
    ],
    spotify: [
      ["#1db954", "#0e7d3a"],
      ["#3ddc97", "#1b9d6b"],
    ],
    apple: [
      ["#7a5cff", "#3b82f6"],
      ["#f43f5e", "#ec4899"],
    ],
  };

  const candidates = paletteByPlatform[platform];
  return candidates[index % candidates.length];
}

function pickDisplayName(apiName: string, tokenProfile: TokenProfile | null) {
  const trimmedApiName = apiName.trim();
  if (trimmedApiName && !isLikelyInternalIdentifier(trimmedApiName)) {
    return trimmedApiName;
  }

  if (tokenProfile?.name?.trim()) {
    return tokenProfile.name.trim();
  }

  if (tokenProfile?.email?.includes("@")) {
    return tokenProfile.email.split("@")[0] || "HUM User";
  }

  return "HUM User";
}

function isLikelyInternalIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  if (trimmed.includes("@")) {
    return false;
  }

  const lowered = trimmed.toLowerCase();
  if (lowered.includes("internal") || lowered.includes("uuid") || lowered.includes("user_")) {
    return true;
  }

  const compact = trimmed.replace(/[-_]/g, "");
  const hasLetters = /[a-zA-Z]/.test(compact);
  const hasNumbers = /\d/.test(compact);
  return compact.length >= 16 && hasLetters && hasNumbers;
}

function isPlaceholderEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) {
    return true;
  }
  return email.endsWith("@example.com");
}

