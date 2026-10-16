import {useState, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './download.module.css';

const GITHUB_RELEASES =
  'https://github.com/CVHub520/X-AnyLabeling/releases/latest';

const downloadCopy = {
  en: {
    title: 'Download X-AnyLabeling',
    description:
      'Download X-AnyLabeling for free or optionally support its continued development.',
    eyebrow: 'Get X-AnyLabeling',
    heading: 'Choose how you would like',
    headingAccent: 'to continue.',
    lede:
      'X-AnyLabeling is free and open source. If it saves you time, consider supporting its continued development.',
    support: {
      label: 'Optional support',
      title: 'Help the project keep moving forward.',
      text:
        'Choose WeChat Pay, Alipay, or Stripe to support the long-term development of X-AnyLabeling.',
      action: 'See support options',
      note: 'WeChat Pay · Alipay · Stripe',
    },
    free: {
      label: 'Free and open source',
      title: 'Continue directly to GitHub Releases.',
      text:
        'Get the latest public release from GitHub. No account, payment, or special access is required.',
      action: 'Download free',
      note: 'No account · No payment · No restrictions',
      installerTitle: 'Install X-AnyLabeling on your computer.',
      installerText: 'Choose your system and build. After installation, new versions can be downloaded and installed from the app.',
      select: 'System and build',
      installerAction: 'Download package',
      allReleases: 'All releases and portable builds',
    },
  },
  zh: {
    title: '下载 X-AnyLabeling',
    description: '免费下载 X-AnyLabeling，或自愿支持项目继续发展。',
    eyebrow: '获取 X-AnyLabeling',
    heading: '选择适合你的方式，',
    headingAccent: '继续使用 X-AnyLabeling。',
    lede:
      'X-AnyLabeling 始终免费开源。如果它为你的工作提供了帮助，欢迎支持项目继续发展。',
    support: {
      label: '自愿支持',
      title: '帮助项目持续向前。',
      text:
        '你可以通过微信支付、支付宝或 Stripe，支持 X-AnyLabeling 的长期发展。',
      action: '查看支持方式',
      note: '微信支付 · 支付宝 · Stripe',
    },
    free: {
      label: '免费开源',
      title: '直接前往 GitHub Releases。',
      text:
        '从 GitHub 获取最新公开版本，无需注册账户、无需付款，也不存在特殊访问限制。',
      action: '免费下载',
      note: '无需账户 · 无需付款 · 无功能限制',
      installerTitle: '在你的电脑上安装 X-AnyLabeling。',
      installerText: '选择系统和版本。安装后，可在应用内下载更新并重启使用新版。',
      select: '系统和版本',
      installerAction: '下载安装包',
      allReleases: '全部版本与便携版',
    },
  },
} as const;

function ArrowIcon(): ReactNode {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.75 8h10.5M9.25 4l4 4-4 4" />
    </svg>
  );
}

function ExternalIcon(): ReactNode {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.25H3.75a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10" />
      <path d="M8.25 2.75h5v5M13 3 7.25 8.75" />
    </svg>
  );
}

function HeartIcon(): ReactNode {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M24.2 10.5c0 6.3-10.2 12.3-10.2 12.3S3.8 16.8 3.8 10.5A5.2 5.2 0 0 1 14 9.2a5.2 5.2 0 0 1 10.2 1.3Z" />
    </svg>
  );
}

function DownloadIcon(): ReactNode {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 4.5v13M8.5 12.5 14 18l5.5-5.5M5.5 23.5h17" />
    </svg>
  );
}

export default function Download(): ReactNode {
  const copy = useLocalizedContent(downloadCopy.en, downloadCopy.zh);
  const {siteConfig} = useDocusaurusContext();
  const installers = (siteConfig.customFields?.releaseInstallers ?? []) as Array<{label: string; url: string}>;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = installers[selectedIndex];

  return (
    <Layout title={copy.title} description={copy.description}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <Heading as="h1" className={styles.title}>
            {copy.heading}
            <span>{copy.headingAccent}</span>
          </Heading>
          <p className={styles.lede}>{copy.lede}</p>
        </header>

        <section className={styles.choiceGrid} aria-label={copy.heading}>
          <article className={`${styles.choiceCard} ${styles.supportCard}`}>
            <div className={styles.cardTop}>
              <span>{copy.support.label}</span>
              <i><HeartIcon /></i>
            </div>
            <div className={styles.cardCopy}>
              <Heading as="h2">{copy.support.title}</Heading>
              <p>{copy.support.text}</p>
            </div>
            <Link className={styles.supportButton} to="/sponsor">
              {copy.support.action} <ArrowIcon />
            </Link>
            <p className={styles.cardNote}>{copy.support.note}</p>
          </article>

          <article className={`${styles.choiceCard} ${styles.freeCard}`}>
            <div className={styles.cardTop}>
              <span>{copy.free.label}</span>
              <i><DownloadIcon /></i>
            </div>
            <div className={styles.cardCopy}>
              <Heading as="h2">{selected ? copy.free.installerTitle : copy.free.title}</Heading>
              <p>{selected ? copy.free.installerText : copy.free.text}</p>
            </div>
            {selected && (
              <label className={styles.packageSelect}>
                <span>{copy.free.select} · {String(siteConfig.customFields?.releaseLabel ?? '')}</span>
                <select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>
                  {installers.map((installer, index) => (
                    <option key={installer.url} value={index}>{installer.label}</option>
                  ))}
                </select>
              </label>
            )}
            <Link className={styles.downloadButton} to={selected?.url ?? GITHUB_RELEASES}>
              {selected ? copy.free.installerAction : copy.free.action} <ExternalIcon />
            </Link>
            <p className={styles.cardNote}>{copy.free.note}</p>
            {selected && <Link className={styles.releaseLink} to={GITHUB_RELEASES}>{copy.free.allReleases}</Link>}
          </article>
        </section>

      </main>
    </Layout>
  );
}
