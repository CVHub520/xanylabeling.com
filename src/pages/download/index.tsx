import {useEffect, useRef, useState, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './download.module.css';

const GITHUB_RELEASES = 'https://github.com/CVHub520/X-AnyLabeling/releases/latest';
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/7sY7sD0HG9K8gHFdGwdIA00';

const content = {
  en: {
    title: 'Download X-AnyLabeling',
    subtitle: 'Choose your system and build.',
    platform: 'Operating system',
    build: 'Build',
    chip: 'Processor',
    download: 'Download',
    support: 'Support X-AnyLabeling',
    purpose: 'Your support helps maintain and improve X-AnyLabeling: integrating models, fixing issues, testing releases, improving documentation, and covering website and infrastructure costs.',
    wechat: 'WeChat Pay',
    alipay: 'Alipay',
    scan: 'Scan to support',
    stripe: 'Continue to Stripe',
    stripeNote: 'One-time support',
    continue: 'Download',
    close: 'Close',
  },
  zh: {
    title: '下载 X-AnyLabeling',
    subtitle: '选择适合你电脑的系统和版本。',
    platform: '操作系统',
    build: '计算平台',
    chip: '处理器',
    download: '下载安装包',
    support: '支持 X-AnyLabeling',
    purpose: '你的支持将用于模型集成与功能开发、问题修复与版本测试、文档维护，以及网站和基础设施的日常运营。感谢你帮助 X-AnyLabeling 持续完善。',
    wechat: '微信支付',
    alipay: '支付宝',
    scan: '扫码支持',
    stripe: '前往 Stripe',
    stripeNote: '单次支持',
    continue: '点击下载',
    close: '关闭',
  },
} as const;

function DownloadIcon(): ReactNode {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 20h16" /></svg>;
}

export default function Download(): ReactNode {
  const copy = useLocalizedContent(content.en, content.zh);
  const {siteConfig} = useDocusaurusContext();
  const installers = (siteConfig.customFields?.releaseInstallers ?? []) as Array<{label: string; url: string}>;
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const defaultIndex = installers.findIndex((installer) => installer.label === 'Windows x64 · CPU');
    return defaultIndex >= 0 ? defaultIndex : 0;
  });
  const [showSupport, setShowSupport] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const logo = useBaseUrl('/img/logo.png');
  const wechatQr = useBaseUrl('/img/sponsor/wechat-pay-v2.jpg');
  const alipayQr = useBaseUrl('/img/sponsor/alipay-v2.jpg');
  const selected = installers[selectedIndex];
  const platforms = ['Windows', 'macOS', 'Linux'].filter((platform) =>
    installers.some((installer) => installer.label.startsWith(platform)),
  );
  const selectedPlatform = platforms.find((platform) => selected?.label.startsWith(platform));
  const variants = installers.map((installer, index) => ({...installer, index})).filter(
    (installer) => selectedPlatform && installer.label.startsWith(selectedPlatform),
  );

  useEffect(() => {
    if (showSupport) dialogRef.current?.showModal();
  }, [showSupport]);

  return (
    <Layout title={copy.title} description={copy.subtitle}>
      <main className={styles.page}>
        <section className={styles.downloadCard}>
          <div className={styles.brandRow}>
            <img src={logo} alt="" className={styles.logo} />
            <span className={styles.version}>{String(siteConfig.customFields?.releaseLabel ?? '')}</span>
          </div>
          <h1>{copy.title}</h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
          {selected && (
            <div className={styles.packageSelect}>
              <fieldset className={styles.optionGroup}>
                <legend>{copy.platform}</legend>
                <div className={styles.options}>
                  {platforms.map((platform) => (
                    <label className={styles.option} key={platform}>
                      <input type="radio" name="platform" checked={selectedPlatform === platform} onChange={() => setSelectedIndex(installers.findIndex((installer) => installer.label.startsWith(platform)))} />
                      <span>{platform}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.optionGroup}>
                <legend>{selectedPlatform === 'macOS' ? copy.chip : copy.build}</legend>
                <div className={styles.options}>
                  {variants.map((installer) => (
                    <label className={styles.option} key={installer.url}>
                      <input type="radio" name="build" checked={selectedIndex === installer.index} onChange={() => setSelectedIndex(installer.index)} />
                      <span>{installer.label.split(' · ')[1]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          <button type="button" className={styles.downloadButton} onClick={() => setShowSupport(true)}>
            <DownloadIcon /> {copy.download}
          </button>
        </section>

        {showSupport && (
          <dialog ref={dialogRef} className={styles.supportDialog} onClose={() => setShowSupport(false)} aria-labelledby="support-dialog-title">
            <button type="button" className={styles.dialogClose} onClick={() => dialogRef.current?.close()} aria-label={copy.close}>×</button>
            <h2 id="support-dialog-title">{copy.support}</h2>
            <p className={styles.dialogIntro}>{copy.purpose}</p>
            <div className={styles.paymentGrid}>
              <div className={styles.paymentCard}>
                <div className={styles.paymentHeader}><strong>{copy.wechat}</strong><i className={styles.wechatBadge}>WeChat</i></div>
                <div className={styles.qrFrame}><img src={wechatQr} alt={copy.wechat} /></div>
                <span>{copy.scan}</span>
              </div>
              <div className={styles.paymentCard}>
                <div className={styles.paymentHeader}><strong>{copy.alipay}</strong><i className={styles.alipayBadge}>Alipay</i></div>
                <div className={styles.qrFrame}><img src={alipayQr} alt={copy.alipay} /></div>
                <span>{copy.scan}</span>
              </div>
              <div className={`${styles.paymentCard} ${styles.stripePayment}`}>
                <div className={styles.paymentHeader}><strong>Stripe</strong><i className={styles.stripeBadge}>stripe</i></div>
                <div><b>US$5</b><span>{copy.stripeNote}</span></div>
                <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">{copy.stripe} ↗</a>
              </div>
            </div>
            <div className={styles.dialogFooter}>
              <Link className={styles.dialogDownload} to={selected?.url ?? GITHUB_RELEASES} onClick={() => dialogRef.current?.close()}>
                <DownloadIcon /> {copy.continue}
              </Link>
            </div>
          </dialog>
        )}
      </main>
    </Layout>
  );
}
