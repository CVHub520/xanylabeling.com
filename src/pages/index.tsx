import {useEffect, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';

import {useLocalizedContent} from '../utils/useLocalizedContent';
import styles from './index.module.css';

type Capability = {
  eyebrow: string;
  title: string;
  description: string;
  icon: 'spark' | 'shapes' | 'video' | 'language' | 'export' | 'model';
};

type RecentFeature = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  video: string;
  poster: string;
};

type Institution = {
  nameEn: string;
  nameZh: string;
  logo: string;
  shape?: 'seal' | 'wide' | 'compact';
};

const institutions: Institution[] = [
  {nameEn: 'MIT', nameZh: '麻省理工学院', logo: '/img/institutions/mit.webp', shape: 'wide'},
  {nameEn: 'Cambridge', nameZh: '剑桥大学', logo: '/img/institutions/cambridge.webp', shape: 'seal'},
  {nameEn: 'Adelaide', nameZh: '阿德莱德大学', logo: '/img/institutions/adelaide.webp', shape: 'wide'},
  {nameEn: 'NTU', nameZh: '南洋理工大学', logo: '/img/institutions/ntu.webp', shape: 'wide'},
  {nameEn: 'Tsinghua', nameZh: '清华大学', logo: '/img/institutions/tsinghua.webp', shape: 'seal'},
  {nameEn: 'PKU', nameZh: '北京大学', logo: '/img/institutions/peking.webp', shape: 'seal'},
  {nameEn: 'HIT', nameZh: '哈尔滨工业大学', logo: '/img/institutions/hit.webp', shape: 'seal'},
  {nameEn: 'ZJU', nameZh: '浙江大学', logo: '/img/institutions/zhejiang.webp', shape: 'wide'},
  {nameEn: 'CAS', nameZh: '中国科学院', logo: '/img/institutions/cas.webp', shape: 'wide'},
  {nameEn: 'IAEA', nameZh: '国际原子能机构', logo: '/img/institutions/iaea.webp', shape: 'seal'},
  {nameEn: 'Tencent', nameZh: '腾讯', logo: '/img/institutions/tencent.webp', shape: 'wide'},
  {nameEn: 'DJI', nameZh: '大疆创新', logo: '/img/institutions/dji.webp', shape: 'wide'},
  {nameEn: 'Alibaba', nameZh: '阿里巴巴', logo: '/img/institutions/damo.webp', shape: 'compact'},
  {
    nameEn: 'AfricaMuseum',
    nameZh: '比利时皇家中非博物馆',
    logo: '/img/institutions/africamuseum.webp',
    shape: 'seal',
  },
  {nameEn: 'Columbia', nameZh: '哥伦比亚大学', logo: '/img/institutions/columbia.webp', shape: 'wide'},
];

const capabilitiesEn: Capability[] = [
  {
    eyebrow: 'Multimodal tasks',
    title: 'Cover the full multimodal data pipeline',
    description:
      'Classification, detection, segmentation, pose, tracking, OCR, document parsing, video classification, captioning, VQA, multimodal conversations, and more.',
    icon: 'spark',
  },
  {
    eyebrow: 'Annotation geometry',
    title: 'Draw the structure each task requires',
    description:
      'Polygons, rectangles, cuboids, rotated boxes, circles, lines, points, masks, and task-specific shapes.',
    icon: 'shapes',
  },
  {
    eyebrow: 'Model library',
    title: 'Start with 100+ ready-to-use model configurations',
    description:
      'Integrate mainstream model families including YOLO, SAM, DINO, Qwen, and PPOCR into annotation workflows.',
    icon: 'model',
  },
  {
    eyebrow: 'Inference stack',
    title: 'Run locally or connect the serving stack you use',
    description:
      'Use ONNX Runtime, TensorRT, OpenCV DNN, or PyTorch, with remote services such as SGLang, vLLM, and TGI.',
    icon: 'video',
  },
  {
    eyebrow: 'Open formats',
    title: 'Keep annotations portable across pipelines',
    description:
      'Work with COCO, VOC, YOLO, DOTA, MOT, masks, PPOCR, MM-Grounding, ShareGPT, and more.',
    icon: 'export',
  },
  {
    eyebrow: 'Multilingual',
    title: 'Work globally, label locally',
    description:
      'Use X-AnyLabeling in English, Simplified Chinese, Japanese, or Korean.',
    icon: 'language',
  },
];

const capabilitiesZh: Capability[] = [
  {
    eyebrow: '多模态任务',
    title: '覆盖完整的多模态数据流程',
    description: '支持分类、检测、分割、姿态估计、跟踪、OCR、文档解析、视频分类、图像描述、视觉问答、多模态对话等任务。',
    icon: 'spark',
  },
  {
    eyebrow: '标注形状',
    title: '绘制每项任务真正需要的结构',
    description: '支持多边形、矩形、长方体、旋转框、圆形、线条、点、掩码以及任务专用形状。',
    icon: 'shapes',
  },
  {
    eyebrow: '模型库',
    title: '从 100+ 个现成模型配置开始',
    description: '将 YOLO、SAM、DINO、Qwen、PPOCR 等系列主流模型接入标注工作流。',
    icon: 'model',
  },
  {
    eyebrow: '推理后端',
    title: '本地运行，或连接现有服务栈',
    description: '支持 ONNX Runtime、TensorRT、OpenCV DNN、PyTorch，以及 SGLang、vLLM、TGI 等远程服务。',
    icon: 'video',
  },
  {
    eyebrow: '开放格式',
    title: '让标注在不同流程间自由流转',
    description: '支持 COCO、VOC、YOLO、DOTA、MOT、MASK、PPOCR、MM-Grounding、ShareGPT 等格式。',
    icon: 'export',
  },
  {
    eyebrow: '多语言界面',
    title: '全球协作，本地语言标注',
    description: '桌面界面支持英语、简体中文、日语和韩语。',
    icon: 'language',
  },
];

const recentFeaturesEn: RecentFeature[] = [
  {
    eyebrow: 'Document parsing',
    title: 'Turn dense pages into editable structure',
    description:
      'Parse layouts, tables, formulas, and text with PaddleOCR, then review every result in place.',
    href: '/workflows#paddle-ocr',
    linkLabel: 'See the document workflow',
    video: 'https://media.xanylabeling.com/videos/document-parsing.mp4',
    poster: '/img/demos/document-parsing-poster.jpg',
  },
  {
    eyebrow: 'Video classifier',
    title: 'Label events without losing the timeline',
    description:
      'Mark frame-accurate segments, assign classes, review descriptions, and export clips or raw frame sequences.',
    href: '/workflows#video-classifier',
    linkLabel: 'See the video workflow',
    video: 'https://media.xanylabeling.com/videos/video-classifier-home.mp4',
    poster: '/img/demos/video-classifier-poster.jpg',
  },
  {
    eyebrow: 'Chatbot',
    title: 'Turn visual context into useful conversations',
    description:
      'Work with vision-language models beside the current image and preserve approved responses as training data.',
    href: '/workflows#chatbot',
    linkLabel: 'See the chatbot workflow',
    video: 'https://media.xanylabeling.com/videos/chatbot.mp4',
    poster: '/img/demos/chatbot-poster.jpg',
  },
];

const recentFeaturesZh: RecentFeature[] = [
  {
    eyebrow: '文档解析',
    title: '将复杂页面转化为可编辑结构',
    description: '使用 PaddleOCR 解析布局、表格、公式和文本，并在原位审核每一项结果。',
    href: '/workflows#paddle-ocr',
    linkLabel: '查看文档工作流',
    video: 'https://media.xanylabeling.com/videos/document-parsing.mp4',
    poster: '/img/demos/document-parsing-poster.jpg',
  },
  {
    eyebrow: '视频分类器',
    title: '标注事件，同时保留完整时间上下文',
    description: '创建逐帧精确的时间片段、分配类别、审核描述，并导出视频片段或原始帧序列。',
    href: '/workflows#video-classifier',
    linkLabel: '查看视频工作流',
    video: 'https://media.xanylabeling.com/videos/video-classifier-home.mp4',
    poster: '/img/demos/video-classifier-poster.jpg',
  },
  {
    eyebrow: '聊天机器人',
    title: '将视觉上下文转化为有价值的对话',
    description: '让视觉语言模型基于当前图像进行交互，并将审核通过的回答保存为训练数据。',
    href: '/workflows#chatbot',
    linkLabel: '查看聊天机器人工作流',
    video: 'https://media.xanylabeling.com/videos/chatbot.mp4',
    poster: '/img/demos/chatbot-poster.jpg',
  },
];

const homeCopy = {
  en: {
    title: 'X-AnyLabeling — AI-powered data annotation',
    description: 'Open-source AI annotation workspace for text, image, video, and multimodal datasets.',
    heroTitle: 'Raw data in',
    heroAccent: 'Reliable labels out',
    download: 'Download X-AnyLabeling',
    quickStart: 'Read the quick start',
    institutionLocale: 'en',
    institutionLabel: 'Trusted by researchers and teams worldwide',
    workspace: 'X-AnyLabeling · Workspace',
    ready: 'Ready',
    interfaceAlt: 'X-AnyLabeling desktop interface showing multiple annotation shapes',
    loopEyebrow: 'A complete annotation loop',
    loopTitle: 'From model-assisted labeling',
    loopAccent: 'to high-quality data',
    loopLede: 'Models produce the initial annotations, people review and refine them, and the resulting data moves directly into training or downstream workflows.',
    stories: [
      {
        index: '01 · Propose',
        title: 'Let the model create the initial annotations',
        description: 'Generate an initial set of annotations, then review, adjust, and approve the results directly in the workspace—without switching between tools.',
        link: 'Browse the model zoo',
        mediaLabel: 'AI-assisted first-pass annotation in X-AnyLabeling',
      },
      {
        index: '02 · Review',
        title: 'Catch what the model missed and refine every annotation',
        description: 'Review model-generated results, correct locations and classes, add missed objects, and make every annotation complete, consistent, and ready for training.',
        link: 'Read the user guide',
        mediaLabel: 'Promptable segmentation results ready for review in X-AnyLabeling',
      },
      {
        index: '03 · Deliver',
        title: 'Export the dataset to train the next model',
        description: 'Turn reviewed annotations into training data, then bring improved models back into review to keep the data flywheel moving.',
        link: 'Read the training guide',
        mediaLabel: 'Model training in X-AnyLabeling',
      },
    ],
    capabilityEyebrow: 'Multimodal annotation workspace',
    capabilityTitle: 'From multimodal data preparation',
    capabilityAccent: 'to intelligent model workflows',
    capabilityLede: 'Unify tasks, annotation methods, model backends, and data formats across the complete workflow from data preparation to model application.',
    recentEyebrow: 'Recently added',
    recentTitle: 'Give every kind of data',
    recentAccent: 'a workflow that fits',
    recentLede: 'Purpose-built tools for document parsing, video classification, and multimodal conversations keep complex tasks moving in one workspace.',
    demoLabel: 'demo',
    ctaTitle: 'Keep control of your data, keep the workflow open',
    ctaText: 'Annotate, review, and export locally, then connect the models, inference services, and open formats that fit your existing toolchain.',
    downloadLatest: 'Download latest',
    viewSource: 'View source',
    backToTop: 'Back to top',
    previewAlt: 'X-AnyLabeling desktop annotation workspace',
  },
  zh: {
    title: 'X-AnyLabeling — AI 驱动的数据标注',
    description: '面向文本、图像、视频和多模态数据集的开源 AI 标注工作区。',
    heroTitle: '从原始数据',
    heroAccent: '到可靠标注',
    download: '下载 X-AnyLabeling',
    quickStart: '阅读快速入门',
    institutionLocale: 'zh',
    institutionLabel: '深受全球研究者与团队信赖',
    workspace: 'X-AnyLabeling · 工作区',
    ready: '就绪',
    interfaceAlt: '显示多种标注形状的 X-AnyLabeling 桌面界面',
    loopEyebrow: '完整的标注闭环',
    loopTitle: '从模型辅助标注',
    loopAccent: '到高质量数据',
    loopLede: '模型完成初步标注，人工集中审核与修正，再将可靠的数据用于训练或接入下游流程。',
    stories: [
      {
        index: '01 · 预标注',
        title: '让模型生成初始标注',
        description: '使用模型自动生成初始标注，并直接在当前工作区中查看、调整和确认结果，无需在不同工具之间来回切换。',
        link: '浏览模型库',
        mediaLabel: 'X-AnyLabeling 中的 AI 辅助首轮标注',
      },
      {
        index: '02 · 审核',
        title: '查漏补缺，完成精细化标注',
        description: '集中审核模型生成的结果，修正位置与类别、补充遗漏目标，确保标注完整、一致且准确，为后续训练准备可靠数据。',
        link: '阅读用户手册',
        mediaLabel: 'X-AnyLabeling 中等待审核的提示式分割结果',
      },
      {
        index: '03 · 交付',
        title: '导出数据集训练下一版模型',
        description: '将审核后的标注沉淀为训练数据，再让迭代后的模型回到审核环节，持续推动数据飞轮运转。',
        link: '查看训练指南',
        mediaLabel: 'X-AnyLabeling 中的模型训练',
      },
    ],
    capabilityEyebrow: '多模态标注工作区',
    capabilityTitle: '从多模态数据准备',
    capabilityAccent: '到智能模型工作流',
    capabilityLede: '统一任务、标注方式、模型后端与数据格式，覆盖从数据准备到模型应用的完整工作流程。',
    recentEyebrow: '近期新增',
    recentTitle: '让不同形态的数据',
    recentAccent: '各有合适的工作流',
    recentLede: '覆盖文档解析、视频分类与多模态对话，让复杂任务也能在同一工作区内清晰推进。',
    demoLabel: '演示',
    ctaTitle: '数据由你掌控，流程保持开放',
    ctaText: '在本地完成标注、审核与导出，并按需连接模型、推理服务和开放格式，让 X-AnyLabeling 自然融入现有工具链。',
    downloadLatest: '下载最新版',
    viewSource: '查看源码',
    backToTop: '返回顶部',
    previewAlt: 'X-AnyLabeling 桌面标注工作区',
  },
} as const;

function ArrowRightIcon(): ReactNode {
  return (
    <svg className={styles.inlineIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.75 8h10.5M9.25 4l4 4-4 4" />
    </svg>
  );
}

function ExternalLinkIcon(): ReactNode {
  return (
    <svg className={styles.inlineIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.25H3.75a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10" />
      <path d="M8.25 2.75h5v5M13 3 7.25 8.75" />
    </svg>
  );
}

function DownloadIcon(): ReactNode {
  return (
    <svg className={styles.inlineIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.5v7.75M4.75 7.5 8 10.75l3.25-3.25M3 13.5h10" />
    </svg>
  );
}

function BackToTop({label}: {label: string}): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      className={`${styles.backToTop} ${visible ? styles.backToTopVisible : ''}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }>
      <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="m5 11 4-4 4 4" />
      </svg>
    </button>
  );
}

function CapabilityIcon({name}: {name: Capability['icon']}): ReactNode {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'spark') {
    return (
      <svg {...common}>
        <path d="M12 2.8c.5 4.9 2.7 7.1 7.6 7.6-4.9.5-7.1 2.7-7.6 7.6-.5-4.9-2.7-7.1-7.6-7.6 4.9-.5 7.1-2.7 7.6-7.6Z" />
        <path d="M19 16.6c.2 2 1.1 2.9 3 3.1-1.9.2-2.8 1.1-3 3-.2-1.9-1.1-2.8-3-3 1.9-.2 2.8-1.1 3-3.1Z" />
      </svg>
    );
  }
  if (name === 'shapes') {
    return (
      <svg {...common}>
        <rect x="3.2" y="3.2" width="7.8" height="7.8" rx="1.8" />
        <path d="m16.8 3.4 4 6.9h-8l4-6.9Z" />
        <circle cx="8" cy="17" r="4" />
        <path d="M14 14h7v7h-7z" />
      </svg>
    );
  }
  if (name === 'video') {
    return (
      <svg {...common}>
        <rect x="2.8" y="5" width="14" height="14" rx="3" />
        <path d="m16.8 9 4.4-2.3v10.6L16.8 15" />
        <path d="m8.4 9.2 4.2 2.8-4.2 2.8V9.2Z" />
      </svg>
    );
  }
  if (name === 'language') {
    return (
      <svg {...common}>
        <path d="M4.2 4.5h15.6v11H9.5L5 19.4v-3.9h-.8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
        <path d="M6.5 9h6M6.5 12h10M15.5 8.8h2" />
      </svg>
    );
  }
  if (name === 'export') {
    return (
      <svg {...common}>
        <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
        <path d="M5 11.5H3.5v8h17v-8H19" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M8 3.5h8l4 4v9l-4 4H8l-4-4v-9l4-4Z" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2M12 18.5v2M3.9 8l1.8 1M18.3 15l1.8 1M3.9 16l1.8-1M18.3 9l1.8-1" />
    </svg>
  );
}

function InstitutionMarquee({
  items,
  locale,
  reverse = false,
}: {
  items: Institution[];
  locale: 'en' | 'zh';
  reverse?: boolean;
}): ReactNode {
  return (
    <div className={styles.institutionViewport}>
      <div className={`${styles.institutionTrack} ${reverse ? styles.institutionTrackReverse : ''}`}>
        {[false, true].map((duplicate) => (
          <div
            key={duplicate ? 'duplicate' : 'original'}
            className={styles.institutionGroup}
            aria-hidden={duplicate || undefined}>
            {items.map((institution) => {
              const label = locale === 'zh' ? institution.nameZh : institution.nameEn;
              return (
                <span key={institution.nameEn} className={styles.institutionMark} title={label}>
                  <span className={styles.institutionIcon}>
                    <img
                      className={styles.institutionLogo}
                      src={institution.logo}
                      alt=""
                      width={institution.shape === 'seal' || institution.shape === 'compact' ? 128 : 320}
                      height={institution.shape === 'seal' || institution.shape === 'compact' ? 128 : 112}
                      loading="eager"
                      decoding="async"
                      data-shape={institution.shape}
                    />
                  </span>
                  <span className={styles.institutionName}>{label}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const copy = useLocalizedContent(homeCopy.en, homeCopy.zh);
  const capabilities = useLocalizedContent(capabilitiesEn, capabilitiesZh);
  const recentFeatures = useLocalizedContent(recentFeaturesEn, recentFeaturesZh);
  const interfaceImage = useBaseUrl('/img/interface-v2.webp');
  const samPoster = useBaseUrl('/img/demos/sam3-poster.png');
  const modelFirstPassPoster = useBaseUrl('/img/demos/model-first-pass-poster.jpg');
  const modelFirstPassVideo = 'https://media.xanylabeling.com/videos/model-first-pass.mp4';
  const trainingPoster = useBaseUrl('/img/demos/training-poster.jpg');
  const trainingVideo = 'https://media.xanylabeling.com/videos/ultralytics-training.mp4';
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <Layout
      title={copy.title}
      description={copy.description}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <Heading as="h1" className={styles.heroTitle}>
              {copy.heroTitle}
              <span>{copy.heroAccent}</span>
            </Heading>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} to="/download">
                {copy.download}
                <DownloadIcon />
              </Link>
              <Link className={styles.secondaryButton} to="/docs/x-anylabeling/get_started">
                {copy.quickStart}
                <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <div className={styles.productStage}>
            <div className={styles.appWindow}>
              <div className={styles.windowBar}>
                <div className={styles.windowDots} aria-hidden="true"><span /><span /><span /></div>
                <div className={styles.windowTitle}>{copy.workspace}</div>
                <div className={styles.windowStatus}><span /> {copy.ready}</div>
              </div>
              <img
                className={styles.interfaceImage}
                src={interfaceImage}
                alt={copy.interfaceAlt}
                loading="eager"
              />
            </div>
          </div>

          <section className={styles.institutionSection} aria-labelledby="institution-heading">
            <p id="institution-heading" className={styles.institutionLabel}>{copy.institutionLabel}</p>
            <div className={styles.institutionRows}>
              <InstitutionMarquee items={institutions} locale={copy.institutionLocale} reverse />
            </div>
          </section>
        </section>

        <section className={`${styles.section} ${styles.loopSection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{copy.loopEyebrow}</p>
            <Heading as="h2" className={styles.sectionTitle}>
              {copy.loopTitle}
              <span>{copy.loopAccent}</span>
            </Heading>
            <p className={styles.sectionLede}>{copy.loopLede}</p>
          </div>

          <div className={styles.storyList}>
            <article className={styles.storyRow}>
              <div className={styles.storyVisual}>
                <video autoPlay loop muted playsInline preload="metadata" poster={modelFirstPassPoster} aria-label={copy.stories[0].mediaLabel}>
                  <source src={modelFirstPassVideo} type="video/mp4" />
                </video>
              </div>
              <div className={styles.storyCopy}>
                <p className={styles.storyIndex}>{copy.stories[0].index}</p>
                <h3>{copy.stories[0].title}</h3>
                <p>{copy.stories[0].description}</p>
                <Link className={styles.textLink} to="/docs/x-anylabeling/model_zoo">
                  {copy.stories[0].link} <ArrowRightIcon />
                </Link>
              </div>
            </article>

            <article className={`${styles.storyRow} ${styles.storyRowReverse}`}>
              <div className={styles.storyVisual}>
                <img src={samPoster} alt={copy.stories[1].mediaLabel} loading="lazy" />
              </div>
              <div className={styles.storyCopy}>
                <p className={styles.storyIndex}>{copy.stories[1].index}</p>
                <h3>{copy.stories[1].title}</h3>
                <p>{copy.stories[1].description}</p>
                <Link className={styles.textLink} to="/docs/x-anylabeling/user_guide">
                  {copy.stories[1].link} <ArrowRightIcon />
                </Link>
              </div>
            </article>

            <article className={styles.storyRow}>
              <div className={styles.storyVisual}>
                <video controls muted playsInline preload="metadata" poster={trainingPoster} aria-label={copy.stories[2].mediaLabel}>
                  <source src={trainingVideo} type="video/mp4" />
                </video>
              </div>
              <div className={styles.storyCopy}>
                <p className={styles.storyIndex}>{copy.stories[2].index}</p>
                <h3>{copy.stories[2].title}</h3>
                <p>{copy.stories[2].description}</p>
                <Link
                  className={styles.textLink}
                  to="/examples/training/ultralytics">
                  {copy.stories[2].link} <ArrowRightIcon />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.capabilitySection}`}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{copy.capabilityEyebrow}</p>
            <Heading as="h2" className={styles.sectionTitle}>
              {copy.capabilityTitle}
              <span>{copy.capabilityAccent}</span>
            </Heading>
            <p className={styles.sectionLede}>{copy.capabilityLede}</p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability) => (
              <article key={capability.title} className={styles.capabilityCard}>
                <span className={styles.capabilityIcon}><CapabilityIcon name={capability.icon} /></span>
                <p className={styles.cardEyebrow}>{capability.eyebrow}</p>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.recentSection}>
          <div className={styles.recentInner}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>{copy.recentEyebrow}</p>
              <Heading as="h2" className={styles.sectionTitle}>
                {copy.recentTitle}
                <span>{copy.recentAccent}</span>
              </Heading>
              <p className={styles.sectionLede}>{copy.recentLede}</p>
            </div>
            <div className={styles.recentGrid}>
              {recentFeatures.map((feature) => (
                <article key={feature.title} className={styles.recentCard}>
                  <div className={styles.videoFrame}>
                    <video
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      poster={withBaseUrl(feature.poster)}
                      aria-label={`${feature.title} ${copy.demoLabel}`}>
                      <source src={feature.video} type="video/mp4" />
                    </video>
                  </div>
                  <div className={styles.recentCopy}>
                    <p className={styles.cardEyebrow}>{feature.eyebrow}</p>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <Link className={styles.textLink} to={feature.href}>
                      {feature.linkLabel} <ArrowRightIcon />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaPanel}>
            <div className={styles.ctaCopy}>
              <Heading as="h2">{copy.ctaTitle}</Heading>
              <p>{copy.ctaText}</p>
              <div className={styles.ctaActions}>
                <Link className={styles.lightButton} to="/download">
                  {copy.downloadLatest} <DownloadIcon />
                </Link>
                <Link className={styles.darkLink} to="https://github.com/CVHub520/X-AnyLabeling">
                  {copy.viewSource} <ExternalLinkIcon />
                </Link>
              </div>
            </div>
            <div className={styles.ctaPreview}>
              <div className={styles.ctaWindowBar} aria-hidden="true"><span /><span /><span /></div>
              <img src={interfaceImage} alt={copy.previewAlt} loading="lazy" />
            </div>
          </div>
        </section>
        <BackToTop label={copy.backToTop} />
      </main>
    </Layout>
  );
}
