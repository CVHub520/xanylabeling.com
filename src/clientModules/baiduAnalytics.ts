import type {ClientModule} from '@docusaurus/types';

type AnalyticsCommand = [string, ...unknown[]];

declare global {
  interface Window {
    _hmt?: {push: (command: AnalyticsCommand) => unknown};
  }
}

const SITE_ID = '81379bb3f4dad1dda2214d2d2a53f62d';
let initialized = false;

function trackLinkClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;

  const url = new URL(link.href);
  let action: string | undefined;

  if (
    url.hostname === 'github.com' &&
    url.pathname.startsWith('/CVHub520/X-AnyLabeling/releases')
  ) {
    action = 'download';
  } else if (url.hostname === 'buy.stripe.com') {
    action = 'sponsor_payment';
  } else if (url.protocol === 'mailto:') {
    action = 'contact';
  } else if (
    url.origin === window.location.origin &&
    /^\/(?:zh-Hans\/)?sponsor\/?$/.test(url.pathname)
  ) {
    action = 'sponsor';
  }

  if (action) {
    window._hmt?.push([
      '_trackEvent',
      'website',
      action,
      window.location.pathname,
    ]);
  }
}

const clientModule: ClientModule = {
  onRouteDidUpdate({location, previousLocation}) {
    if (
      process.env.NODE_ENV !== 'production' ||
      !['xanylabeling.com', 'www.xanylabeling.com'].includes(
        window.location.hostname,
      )
    ) {
      return;
    }

    if (!initialized) {
      initialized = true;
      const queue = window._hmt || ([] as AnalyticsCommand[]);
      window._hmt = queue;
      // Docusaurus handles page views below, including the initial render.
      queue.push(['_setAutoPageview', false]);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://hm.baidu.com/hm.js?${SITE_ID}`;
      document.head.appendChild(script);
      document.addEventListener('click', trackLinkClick);
    }

    const path = location.pathname + location.search;
    const previousPath = previousLocation
      ? previousLocation.pathname + previousLocation.search
      : undefined;
    // Anchor-only navigation does not represent another page view.
    if (path !== previousPath) {
      window._hmt?.push(['_trackPageview', path]);
    }
  },
};

export default clientModule;
