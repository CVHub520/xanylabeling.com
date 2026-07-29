import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkGitHubAlerts from './plugins/remarkGitHubAlerts';

const GITHUB_REPO = 'CVHub520/X-AnyLabeling';
const DEFAULT_RELEASE_LABEL = 'v4.0.0-beta.13';
const DEFAULT_STAR_LABEL = '10k+';

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchStarLabel(): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: githubHeaders(),
    });
    if (!res.ok) return DEFAULT_STAR_LABEL;
    const data = (await res.json()) as {stargazers_count?: unknown};
    if (typeof data.stargazers_count !== 'number') return DEFAULT_STAR_LABEL;
    return new Intl.NumberFormat('en-US').format(data.stargazers_count);
  } catch {
    return DEFAULT_STAR_LABEL;
  }
}

async function fetchReleaseLabel(): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
      headers: githubHeaders(),
    });
    if (!res.ok) return DEFAULT_RELEASE_LABEL;
    const releases = (await res.json()) as Array<{
      draft?: unknown;
      tag_name?: unknown;
    }>;
    const release = releases.find(
      (item) => item.draft !== true && typeof item.tag_name === 'string',
    );
    if (!release || typeof release.tag_name !== 'string') {
      return DEFAULT_RELEASE_LABEL;
    }
    return release.tag_name;
  } catch {
    return DEFAULT_RELEASE_LABEL;
  }
}

export default async function createConfig(): Promise<Config> {
  const [releaseLabel, starLabel] = await Promise.all([
    fetchReleaseLabel(),
    fetchStarLabel(),
  ]);

  const config: Config = {
    title: 'X-AnyLabeling',
    tagline: 'Local-first, AI-powered annotation for real-world multimodal data.',
    favicon: 'img/favicon-round.png',

    future: {
      v4: true,
    },

    url: 'https://xanylabeling.com',
    baseUrl: '/',
    organizationName: 'CVHub520',
    projectName: 'X-AnyLabeling',

    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    markdown: {
      hooks: {
        onBrokenMarkdownLinks: 'throw',
      },
    },

    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'zh-Hans'],
      localeConfigs: {
        en: {
          label: 'English',
        },
        'zh-Hans': {
          label: '简体中文',
        },
      },
    },

    presets: [
      [
        'classic',
        {
          docs: {
            id: 'x-anylabeling',
            path: '.generated/docs/x-anylabeling/en',
            routeBasePath: 'docs/x-anylabeling',
            sidebarPath: './sidebars.x-anylabeling.ts',
            beforeDefaultRemarkPlugins: [remarkGitHubAlerts],
            editUrl: ({docPath, locale}) => {
              const docsLocale = locale === 'zh-Hans' ? 'zh_cn' : 'en';
              return `https://github.com/${GITHUB_REPO}/edit/main/docs/${docsLocale}/${docPath}`;
            },
            showLastUpdateTime: false,
            showLastUpdateAuthor: false,
          },
          blog: {
            showReadingTime: true,
            feedOptions: {
              type: ['rss', 'atom'],
              xslt: true,
            },
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        } satisfies Preset.Options,
      ],
    ],

    plugins: [
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'examples',
          path: '.generated/examples/x-anylabeling/en',
          routeBasePath: 'examples',
          sidebarPath: false,
          beforeDefaultRemarkPlugins: [remarkGitHubAlerts],
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
      ],
    ],

    themes: [
      [
        '@easyops-cn/docusaurus-search-local',
        {
          hashed: true,
          language: ['en', 'zh'],
          indexDocs: true,
          indexBlog: true,
          indexPages: true,
          docsRouteBasePath: ['/docs/x-anylabeling', '/examples'],
          docsDir: [
            '.generated/docs/x-anylabeling/en',
            '.generated/examples/x-anylabeling/en',
          ],
          docsPluginIdForPreferredVersion: 'x-anylabeling',
        },
      ],
    ],

    themeConfig: {
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'X-AnyLabeling',
        logo: {
          alt: 'X-AnyLabeling Logo',
          src: 'img/logo.png',
        },
        items: [
          {to: '/', label: 'Home', position: 'left', exact: true},
          {to: '/docs/x-anylabeling/get_started', label: 'Docs', position: 'left'},
          {to: '/examples', label: 'Tasks', position: 'left'},
          {to: '/workflows', label: 'Workflows', position: 'left'},
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/community', label: 'Community', position: 'left'},
          {
            to: '/sponsor',
            label: 'Sponsor',
            position: 'left',
          },
          {
            type: 'html',
            value: escapeHtml(releaseLabel),
            position: 'right',
            className: 'navbar-release-link',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: `https://github.com/${GITHUB_REPO}`,
            label: starLabel,
            position: 'right',
            className: 'header-github-link header-github-star-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Product',
            items: [
              {label: 'X-AnyLabeling', href: `https://github.com/${GITHUB_REPO}`},
              {label: 'X-AnyLabeling-Server', href: 'https://github.com/CVHub520/X-AnyLabeling-Server'},
            ],
          },
          {
            title: 'Documentation',
            items: [
              {label: 'Docs home', to: '/docs/x-anylabeling/get_started'},
              {label: 'Quick Start', to: '/docs/x-anylabeling/get_started'},
              {label: 'Model Zoo', to: '/docs/x-anylabeling/model_zoo'},
              {label: 'Remote Services', to: '/docs/x-anylabeling/remote_service/get_started'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'GitHub Discussions', href: 'https://github.com/CVHub520/X-AnyLabeling/discussions'},
              {label: 'Report an Issue', href: 'https://github.com/CVHub520/X-AnyLabeling/issues'},
              {label: 'Contributing', href: 'https://github.com/CVHub520/X-AnyLabeling/blob/main/CONTRIBUTING.md'},
              {label: 'Blog', to: '/blog'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'License', href: 'https://github.com/CVHub520/X-AnyLabeling/blob/main/LICENSE'},
              {label: 'Contact', href: 'mailto:cv_hub@163.com'},
              {label: 'Sponsor', to: '/sponsor'},
            ],
          },
        ],
        copyright: '© 2026 CVHub. All rights reserved.',
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'json', 'yaml'],
      },
    } satisfies Preset.ThemeConfig,
  };

  return config;
}
