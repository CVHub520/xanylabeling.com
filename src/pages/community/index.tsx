import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './community.module.css';

type Channel = {
  number: string;
  title: string;
  description: string;
  href: string;
  action: string;
  icon: 'issue' | 'talk' | 'code' | 'heart';
};

const channelsEn: Channel[] = [
  {
    number: '01',
    title: 'Report an issue',
    description: 'Share a reproducible bug, request a feature, or follow work already in progress.',
    href: 'https://github.com/CVHub520/X-AnyLabeling/issues',
    action: 'Open GitHub Issues',
    icon: 'issue',
  },
  {
    number: '02',
    title: 'Start a discussion',
    description: 'Ask workflow questions, compare setups, and learn from other dataset builders.',
    href: 'https://github.com/CVHub520/X-AnyLabeling/discussions',
    action: 'Join Discussions',
    icon: 'talk',
  },
  {
    number: '03',
    title: 'Contribute code or docs',
    description: 'Fix a sharp edge, add a model integration, improve a translation, or document what you learned.',
    href: 'https://github.com/CVHub520/X-AnyLabeling/blob/main/CONTRIBUTING.md',
    action: 'Read the guide',
    icon: 'code',
  },
  {
    number: '04',
    title: 'Support the project',
    description: 'Help sustain independent maintenance and the long-term health of the open-source project.',
    href: '/sponsor',
    action: 'Sponsor X-AnyLabeling',
    icon: 'heart',
  },
];

const channelsZh: Channel[] = [
  {
    number: '01',
    title: '报告问题',
    description: '提交可复现的缺陷、提出功能建议，或跟进正在进行的工作。',
    href: 'https://github.com/CVHub520/X-AnyLabeling/issues',
    action: '打开 GitHub Issues',
    icon: 'issue',
  },
  {
    number: '02',
    title: '发起讨论',
    description: '交流工作流问题、比较不同配置，并向其他数据集构建者学习。',
    href: 'https://github.com/CVHub520/X-AnyLabeling/discussions',
    action: '加入 Discussions',
    icon: 'talk',
  },
  {
    number: '03',
    title: '贡献代码或文档',
    description: '修复体验问题、集成新模型、改进翻译，或记录你的实践经验。',
    href: 'https://github.com/CVHub520/X-AnyLabeling/blob/main/CONTRIBUTING.md',
    action: '阅读贡献指南',
    icon: 'code',
  },
  {
    number: '04',
    title: '支持项目',
    description: '帮助项目维持独立维护与长期健康发展。',
    href: '/sponsor',
    action: '赞助 X-AnyLabeling',
    icon: 'heart',
  },
];

const communityCopy = {
  en: {
    title: 'Community',
    description: 'Join the open-source X-AnyLabeling community on GitHub.',
    eyebrow: 'Built in the open',
    heading: 'Better labeling tools are',
    headingAccent: 'a community project.',
    lede: 'X-AnyLabeling grows through real datasets, honest feedback, careful bug reports, model integrations, translations, and shared experience.',
    visit: 'Visit the GitHub repository',
    valuesLabel: 'Community values',
    values: [
      ['Specific beats vague.', 'Reproductions, examples, and concrete proposals help everyone move faster.'],
      ['Small changes matter.', 'A typo, a test case, or a clearer screenshot can be a meaningful contribution.'],
      ['Share the context.', 'The most useful workflows come from people solving real annotation problems.'],
    ],
    channelsEyebrow: 'Find your way in',
    channelsHeading: 'Choose the channel that matches the work.',
    contributionEyebrow: 'First contribution',
    contributionHeading: 'You do not need to know the whole codebase.',
    contributionText: 'Start with one visible problem, keep the change focused, and explain the user impact. Maintainers can help with the rest.',
    steps: [
      ['Find an issue', 'Pick a scoped bug, doc gap, or model request.'],
      ['Read the guide', 'Set up the project and follow its contribution conventions.'],
      ['Open a pull request', 'Show what changed, why it matters, and how you verified it.'],
    ],
  },
  zh: {
    title: '社区',
    description: '加入 GitHub 上的 X-AnyLabeling 开源社区。',
    eyebrow: '开放共建',
    heading: '更好的标注工具，',
    headingAccent: '来自社区共同建设。',
    lede: '真实数据集、坦诚反馈、严谨的问题报告、模型集成、翻译与经验分享，共同推动 X-AnyLabeling 成长。',
    visit: '访问 GitHub 仓库',
    valuesLabel: '社区价值观',
    values: [
      ['具体胜过模糊。', '可复现步骤、真实示例和明确建议能帮助所有人更快推进。'],
      ['小改动同样重要。', '修正错别字、补充测试或提供更清晰的截图，都是有价值的贡献。'],
      ['分享完整背景。', '最有用的工作流往往来自正在解决真实标注问题的人。'],
    ],
    channelsEyebrow: '找到参与方式',
    channelsHeading: '选择与你当前工作最匹配的渠道。',
    contributionEyebrow: '第一次贡献',
    contributionHeading: '你不需要先读懂整个代码库。',
    contributionText: '从一个清晰可见的问题开始，保持改动聚焦并说明用户影响，其余部分维护者可以协助。',
    steps: [
      ['寻找问题', '选择范围明确的缺陷、文档缺口或模型需求。'],
      ['阅读指南', '完成项目配置并遵循贡献约定。'],
      ['提交 Pull Request', '说明改动内容、价值以及验证方式。'],
    ],
  },
} as const;

function ChannelIcon({name}: {name: Channel['icon']}): ReactNode {
  const props = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true};
  if (name === 'issue') return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.3M12 16.5h.01" /></svg>;
  if (name === 'talk') return <svg {...props}><path d="M4.5 4.5h15v11h-10l-5 4v-15Z" /><path d="M8 9h8M8 12h5" /></svg>;
  if (name === 'code') return <svg {...props}><path d="m8.3 7-5 5 5 5M15.7 7l5 5-5 5M13.5 4.5l-3 15" /></svg>;
  return <svg {...props}><path d="M20.5 8.8c0 5.2-8.5 10.3-8.5 10.3S3.5 14 3.5 8.8A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 8.5 1.1Z" /></svg>;
}

export default function Community(): ReactNode {
  const copy = useLocalizedContent(communityCopy.en, communityCopy.zh);
  const channels = useLocalizedContent(channelsEn, channelsZh);
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
            <Link className={styles.heroAction} to="https://github.com/CVHub520/X-AnyLabeling">
              {copy.visit} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className={styles.constellation} aria-hidden="true">
            <div className={styles.orbitOne}><span /><span /><span /></div>
            <div className={styles.orbitTwo}><span /><span /></div>
            <div className={styles.logoMark}><i /></div>
          </div>
        </header>

        <section className={styles.values} aria-label={copy.valuesLabel}>
          {copy.values.map(([title, description], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className={styles.channelsSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.channelsEyebrow}</p>
            <Heading as="h2">{copy.channelsHeading}</Heading>
          </div>
          <div className={styles.channelGrid}>
            {channels.map((channel) => (
              <Link key={channel.title} to={channel.href} className={styles.channelCard}>
                <div className={styles.cardTop}><span>{channel.number}</span><i><ChannelIcon name={channel.icon} /></i></div>
                <h3>{channel.title}</h3>
                <p>{channel.description}</p>
                <span className={styles.cardAction}>{channel.action} <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.contributePanel}>
          <div>
            <p className={styles.eyebrow}>{copy.contributionEyebrow}</p>
            <Heading as="h2">{copy.contributionHeading}</Heading>
            <p>{copy.contributionText}</p>
          </div>
          <ol>
            {copy.steps.map(([title, description], index) => (
              <li key={title}>
                <span>{index + 1}</span>
                <div><strong>{title}</strong><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </Layout>
  );
}
