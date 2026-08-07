import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const GITHUB_REPO = 'CVHub520/X-AnyLabeling';
const STAR_CACHE_KEY = 'xanylabeling.githubStars.v3';
const STAR_CACHE_TTL_MS = 5 * 60 * 1000;

type StarCache = {
  label: string;
  updatedAt: number;
};

const GitHubStarsContext = createContext<string | null>(null);

let inFlightRequest: Promise<StarCache | null> | null = null;

function formatStars(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}

function readStarCache(): StarCache | null {
  try {
    const raw = window.localStorage.getItem(STAR_CACHE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<StarCache>;
    if (typeof value.label !== 'string' || typeof value.updatedAt !== 'number') {
      return null;
    }
    return {label: value.label, updatedAt: value.updatedAt};
  } catch {
    return null;
  }
}

function writeStarCache(cache: StarCache): void {
  try {
    window.localStorage.setItem(STAR_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Keep the in-memory value when storage is unavailable.
  }
}

function fetchStarCache(): Promise<StarCache | null> {
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
    headers: {Accept: 'application/vnd.github+json'},
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as {stargazers_count?: unknown};
      if (typeof data.stargazers_count !== 'number') return null;
      return {
        label: formatStars(data.stargazers_count),
        updatedAt: Date.now(),
      };
    })
    .catch(() => null)
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

function cacheIsFresh(cache: StarCache): boolean {
  return Date.now() - cache.updatedAt < STAR_CACHE_TTL_MS;
}

export function GitHubStarsProvider({children}: {children: ReactNode}): ReactNode {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = async (force = false): Promise<void> => {
      const cached = readStarCache();
      if (cached) setLabel(cached.label);
      if (!force && cached && cacheIsFresh(cached)) return;

      const latest = await fetchStarCache();
      if (!active || !latest) return;
      writeStarCache(latest);
      setLabel(latest.label);
    };

    const handleStorage = (event: StorageEvent): void => {
      if (event.key !== STAR_CACHE_KEY || !event.newValue) return;
      const cached = readStarCache();
      if (cached) setLabel(cached.label);
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') void refresh();
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(true), STAR_CACHE_TTL_MS);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <GitHubStarsContext.Provider value={label}>
      {children}
    </GitHubStarsContext.Provider>
  );
}

export function useGitHubStarsLabel(fallback: ReactNode): ReactNode {
  return useContext(GitHubStarsContext) ?? fallback;
}
