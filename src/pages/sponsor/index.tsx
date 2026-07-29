import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './sponsor.module.css';

const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/7sY7sD0HG9K8gHFdGwdIA00';
const GITHUB_RELEASES =
  'https://github.com/CVHub520/X-AnyLabeling/releases/latest';
const GITHUB_REPOSITORY =
  'https://github.com/CVHub520/X-AnyLabeling';

const sponsorCopy = {
  en: {
    title: 'Sponsor X-AnyLabeling',
    description:
      'Support the independent development and long-term maintenance of the open-source X-AnyLabeling project.',
    eyebrow: 'Support independent open source',
    heading: 'Keep better labeling tools',
    headingAccent: 'open to everyone.',
    lede: 'Help X-AnyLabeling keep improving for the long run.',
    download: 'Download free from GitHub',
    source: 'View source',
    methodsEyebrow: 'Choose a method',
    methodsTitle: 'Three simple ways to help.',
    methodsText:
      'Sponsorship is completely optional. Use a familiar local payment method or choose Stripe for a secure international payment. X-AnyLabeling remains free and open source, and every public release is always available on GitHub.',
    wechat: {
      name: 'WeChat Pay',
      note: 'For supporters in mainland China',
      action: 'Scan with WeChat',
      alt: 'WeChat Pay QR code for supporting X-AnyLabeling',
    },
    alipay: {
      name: 'Alipay',
      note: 'For supporters in mainland China',
      action: 'Scan with Alipay',
      alt: 'Alipay QR code for supporting X-AnyLabeling',
    },
    stripe: {
      name: 'Stripe',
      note: 'For international supporters',
      amount: 'US$5',
      frequency: 'one-time support',
      title: 'A small contribution with lasting impact.',
      text:
        'Pay securely through Stripe with the payment methods available in your country. No account or subscription is required.',
      action: 'Continue to Stripe',
      secure: 'Secure checkout hosted by Stripe',
    },
    impactEyebrow: 'Where support goes',
    impactTitle: 'Small contributions sustain the work between releases.',
    impact: [
      {
        number: '01',
        title: 'Reliable releases',
        text: 'Packaging, compatibility checks, regression testing, and platform-specific fixes.',
      },
      {
        number: '02',
        title: 'Clear documentation',
        text: 'Practical guides, translations, examples, and reproducible workflows.',
      },
      {
        number: '03',
        title: 'More model integrations',
        text: 'Maintaining existing integrations and bringing useful new models into the workflow.',
      },
    ],
    thanks:
      'Thank you for using X-AnyLabeling, sharing feedback, and helping the project grow—financial support is only one way to contribute.',
  },
  zh: {
    title: '赞助 X-AnyLabeling',
    description: '支持开源项目 X-AnyLabeling 的独立开发与长期维护。',
    eyebrow: '支持独立开源项目',
    heading: '让更好的标注工具',
    headingAccent: '始终向每个人开放。',
    lede: '让 X-AnyLabeling 持续进步，也走得更长远。',
    download: '从 GitHub 免费下载',
    source: '查看源代码',
    methodsEyebrow: '选择支持方式',
    methodsTitle: '三种简单的支持渠道。',
    methodsText:
      '赞助完全自愿。国内用户可以选择熟悉的支付方式，海外用户可以通过 Stripe 安全支付。X-AnyLabeling 将继续保持免费和开源，所有公开版本始终可以从 GitHub 下载。',
    wechat: {
      name: '微信支付',
      note: '适合中国大陆用户',
      action: '使用微信扫码',
      alt: '用于支持 X-AnyLabeling 的微信支付二维码',
    },
    alipay: {
      name: '支付宝',
      note: '适合中国大陆用户',
      action: '使用支付宝扫码',
      alt: '用于支持 X-AnyLabeling 的支付宝二维码',
    },
    stripe: {
      name: 'Stripe',
      note: '适合海外用户',
      amount: 'US$5',
      frequency: '单次支持',
      title: '一份不大的支持，也能带来长久影响。',
      text:
        '通过 Stripe 使用所在国家或地区支持的支付方式安全付款，无需注册账户，也不会自动续费。',
      action: '前往 Stripe 支付',
      secure: '由 Stripe 提供安全结账服务',
    },
    impactEyebrow: '支持将用于',
    impactTitle: '每一份支持，都在帮助项目稳步走向下一次发布。',
    impact: [
      {
        number: '01',
        title: '稳定发布',
        text: '用于应用打包、兼容性检查、回归测试和不同平台的问题修复。',
      },
      {
        number: '02',
        title: '清晰文档',
        text: '用于维护实践指南、翻译、示例和可复现的工作流。',
      },
      {
        number: '03',
        title: '更多模型集成',
        text: '持续维护已有集成，并将实用的新模型带入标注流程。',
      },
    ],
    thanks:
      '感谢你使用 X-AnyLabeling、分享反馈并帮助项目成长——资金支持只是参与开源项目的众多方式之一。',
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
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M27.7 11.9c0 7.2-11.7 14.1-11.7 14.1S4.3 19.1 4.3 11.9A5.9 5.9 0 0 1 16 10.4a5.9 5.9 0 0 1 11.7 1.5Z" />
    </svg>
  );
}

function ScanIcon(): ReactNode {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 6V3.5a1 1 0 0 1 1-1H6M12 2.5h2.5a1 1 0 0 1 1 1V6M15.5 12v2.5a1 1 0 0 1-1 1H12M6 15.5H3.5a1 1 0 0 1-1-1V12" />
      <path d="M6.25 6.25h2v2h-2zM10.25 6.25h1.5v1.5h-1.5zM6.25 10.25h1.5v1.5h-1.5zM10.25 10.25h2v2h-2z" />
    </svg>
  );
}

function ChoiceIcon(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4v2.2a3.8 3.8 0 0 0 3.8 3.8H16" />
      <path d="M4 16v-2.2A3.8 3.8 0 0 1 7.8 10" />
      <path d="m13.25 7.25 2.75 2.75-2.75 2.75" />
    </svg>
  );
}

export default function Sponsor(): ReactNode {
  const copy = useLocalizedContent(sponsorCopy.en, sponsorCopy.zh);
  const logo = useBaseUrl('/img/logo.png');
  const wechatQr = useBaseUrl('/img/sponsor/wechat-pay-v2.jpg');
  const alipayQr = useBaseUrl('/img/sponsor/alipay-v2.jpg');

  return (
    <Layout title={copy.title} description={copy.description}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <Heading as="h1" className={styles.title}>
              {copy.heading}
              <span>{copy.headingAccent}</span>
            </Heading>
            <p className={styles.lede}>{copy.lede}</p>
          </div>

          <div className={styles.supportMark} aria-hidden="true">
            <span className={styles.markHalo} />
            <div className={styles.markCard}>
              <div className={styles.markHeader}>
                <img src={logo} alt="" />
                <span>OPEN SOURCE</span>
              </div>
              <HeartIcon />
              <strong>X-AnyLabeling</strong>
              <small>Built in the open</small>
            </div>
          </div>
        </header>

        <section className={styles.methodsSection}>
          <div className={styles.openPromise}>
            <div>
              <span className={styles.promiseMark}><ChoiceIcon /></span>
              <div>
                <p className={styles.eyebrow}>{copy.methodsEyebrow}</p>
                <Heading as="h2">{copy.methodsTitle}</Heading>
                <p>{copy.methodsText}</p>
              </div>
            </div>
            <div className={styles.promiseActions}>
              <Link className={styles.primaryButton} to={GITHUB_RELEASES}>
                {copy.download} <ExternalIcon />
              </Link>
              <Link className={styles.textLink} to={GITHUB_REPOSITORY}>
                {copy.source} <ArrowIcon />
              </Link>
            </div>
          </div>

          <div className={styles.methodGrid}>
            <article className={`${styles.qrCard} ${styles.wechatCard}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{copy.wechat.name}</h3>
                  <p>{copy.wechat.note}</p>
                </div>
                <span className={`${styles.methodBadge} ${styles.wechatBadge}`}>
                  WeChat
                </span>
              </div>
              <div className={styles.qrFrame}>
                <img src={wechatQr} alt={copy.wechat.alt} loading="lazy" />
              </div>
              <p className={styles.scanLabel}>
                <ScanIcon /> {copy.wechat.action}
              </p>
            </article>

            <article className={`${styles.qrCard} ${styles.alipayCard}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{copy.alipay.name}</h3>
                  <p>{copy.alipay.note}</p>
                </div>
                <span className={`${styles.methodBadge} ${styles.alipayBadge}`}>
                  Alipay
                </span>
              </div>
              <div className={styles.qrFrame}>
                <img src={alipayQr} alt={copy.alipay.alt} loading="lazy" />
              </div>
              <p className={styles.scanLabel}>
                <ScanIcon /> {copy.alipay.action}
              </p>
            </article>

            <article className={styles.stripeCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{copy.stripe.name}</h3>
                  <p>{copy.stripe.note}</p>
                </div>
                <span className={`${styles.methodBadge} ${styles.stripeBadge}`}>
                  stripe
                </span>
              </div>

              <div className={styles.price}>
                <strong>{copy.stripe.amount}</strong>
                <span>{copy.stripe.frequency}</span>
              </div>

              <div className={styles.stripeCopy}>
                <Heading as="h4">{copy.stripe.title}</Heading>
                <p>{copy.stripe.text}</p>
              </div>

              <Link
                className={styles.stripeButton}
                to={STRIPE_PAYMENT_LINK}>
                {copy.stripe.action} <ExternalIcon />
              </Link>
              <p className={styles.secureLabel}>
                <span aria-hidden="true">◇</span> {copy.stripe.secure}
              </p>
            </article>
          </div>
        </section>

        <section className={styles.impactSection}>
          <div className={styles.impactIntro}>
            <p className={styles.eyebrow}>{copy.impactEyebrow}</p>
            <Heading as="h2">{copy.impactTitle}</Heading>
          </div>
          <div className={styles.impactGrid}>
            {copy.impact.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className={styles.thanks}>{copy.thanks}</p>
        </section>
      </main>
    </Layout>
  );
}
