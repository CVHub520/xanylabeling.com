import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

const GITHUB_REPO = 'CVHub520/X-AnyLabeling';
const STAR_CACHE_KEY = 'xanylabeling.githubStars.v2';
const STAR_CACHE_TTL_MS = 5 * 60 * 1000;

type StarCache = {
  label: string;
  updatedAt: number;
};

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

function writeStarCache(label: string): void {
  try {
    window.localStorage.setItem(
      STAR_CACHE_KEY,
      JSON.stringify({label, updatedAt: Date.now()} satisfies StarCache),
    );
  } catch {
    // Ignore storage failures; the build-time label remains visible.
  }
}

function updateStarLabel(label: string): void {
  document.querySelectorAll<HTMLAnchorElement>('.header-github-star-link').forEach((link) => {
    link.textContent = label;
  });
}

async function fetchStarLabel(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: {Accept: 'application/vnd.github+json'},
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {stargazers_count?: unknown};
    return typeof data.stargazers_count === 'number'
      ? formatStars(data.stargazers_count)
      : null;
  } catch {
    return null;
  }
}

export default function Root({children}: {children: React.ReactNode}): React.ReactElement {
  const {pathname} = useLocation();

  useEffect(() => {
    const cached = readStarCache();
    if (cached && Date.now() - cached.updatedAt < STAR_CACHE_TTL_MS) {
      updateStarLabel(cached.label);
      return;
    }

    void fetchStarLabel().then((label) => {
      if (!label) return;
      writeStarCache(label);
      updateStarLabel(label);
    });
  }, [pathname]);

  return <>{children}</>;
}
