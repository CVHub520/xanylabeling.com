import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import content from '../../../.generated/data/x-anylabeling.json';
import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './workflows.module.css';

type WorkflowId = (typeof content.workflows)[number]['id'];
type WorkflowPresentation = {
  eyebrow: string;
  title: string;
  description: string;
  outcomes: string[];
  image: string;
  imageAlt: string;
  tone: 'rust' | 'sage' | 'ochre' | 'plum' | 'slate';
};

const presentationsEn: Record<WorkflowId, WorkflowPresentation> = {
  'image-classifier': {
    eyebrow: 'Image classifier',
    title: 'Label the image, the object, or both.',
    description:
      'Build multiclass, multilabel, and hierarchical classification datasets without separating image-level decisions from shape-level review.',
    outcomes: ['Image and shape labels', 'Reusable class groups', 'Dataset statistics'],
    image: '/img/workflow-covers/image-classifier.webp',
    imageAlt: '',
    tone: 'rust',
  },
  'paddle-ocr': {
    eyebrow: 'PaddleOCR',
    title: 'Turn dense pages into editable structure.',
    description:
      'Parse text, tables, formulas, and document layouts with PaddleOCR, then inspect and correct every region in the same workspace.',
    outcomes: ['Text recognition', 'Document layout', 'Key information extraction'],
    image: '/img/workflow-covers/paddle-ocr.webp',
    imageAlt: '',
    tone: 'sage',
  },
  'video-classifier': {
    eyebrow: 'Video classifier',
    title: 'Describe what changes across the timeline.',
    description:
      'Create and review labeled time segments, navigate long clips efficiently, and preserve the temporal context behind every classification.',
    outcomes: ['Timeline segments', 'Frame-accurate review', 'AI-assisted descriptions'],
    image: '/img/workflow-covers/video-classifier.webp',
    imageAlt: '',
    tone: 'ochre',
  },
  vqa: {
    eyebrow: 'Visual question answering',
    title: 'Build structured answers from visual evidence.',
    description:
      'Design repeatable question templates, combine manual and model-assisted answers, and export data for modern vision-language training.',
    outcomes: ['Question templates', 'Model-assisted answers', 'Structured VQA datasets'],
    image: '/img/workflow-covers/visual-question-answering.webp',
    imageAlt: '',
    tone: 'plum',
  },
  chatbot: {
    eyebrow: 'Chatbot',
    title: 'Turn an image into a reviewable conversation.',
    description:
      'Talk to a vision-language model with the current image in context, refine the response, and preserve approved conversations as training data.',
    outcomes: ['Context-aware conversations', 'Image captioning', 'ShareGPT export'],
    image: '/img/workflow-covers/chatbot.webp',
    imageAlt: '',
    tone: 'slate',
  },
};

const presentationsZh: Record<WorkflowId, WorkflowPresentation> = {
  'image-classifier': {
    eyebrow: '图像分类器',
    title: '标注整张图像、局部目标，或两者兼顾。',
    description: '在同一审核流程中构建多分类、多标签和层级分类数据集，无需拆分图像级判断与形状级标注。',
    outcomes: ['图像与形状标签', '可复用类别组', '数据集统计'],
    image: '/img/workflow-covers/image-classifier.webp',
    imageAlt: '',
    tone: 'rust',
  },
  'paddle-ocr': {
    eyebrow: 'PaddleOCR',
    title: '将复杂页面转化为可编辑的结构。',
    description: '使用 PaddleOCR 解析文本、表格、公式和文档布局，并在同一工作区检查、修正每一个区域。',
    outcomes: ['文字识别', '文档布局分析', '关键信息抽取'],
    image: '/img/workflow-covers/paddle-ocr.webp',
    imageAlt: '',
    tone: 'sage',
  },
  'video-classifier': {
    eyebrow: '视频分类器',
    title: '描述时间轴上发生的变化。',
    description: '创建并审核带标签的时间片段，高效浏览长视频，同时保留每次分类判断所需的时间上下文。',
    outcomes: ['时间轴片段', '逐帧精确审核', 'AI 辅助描述'],
    image: '/img/workflow-covers/video-classifier.webp',
    imageAlt: '',
    tone: 'ochre',
  },
  vqa: {
    eyebrow: '视觉问答',
    title: '从视觉证据中构建结构化答案。',
    description: '设计可复用的问题模板，结合人工与模型辅助回答，并导出现代视觉语言模型所需的训练数据。',
    outcomes: ['问题模板', '模型辅助回答', '结构化问答数据集'],
    image: '/img/workflow-covers/visual-question-answering.webp',
    imageAlt: '',
    tone: 'plum',
  },
  chatbot: {
    eyebrow: '聊天机器人',
    title: '将图像转化为可审核的对话。',
    description: '让视觉语言模型基于当前图像进行对话，修正回答，并将审核通过的会话保存为训练数据。',
    outcomes: ['上下文感知对话', '图像描述', 'ShareGPT 导出'],
    image: '/img/workflow-covers/chatbot.webp',
    imageAlt: '',
    tone: 'slate',
  },
};

const workflowsCopy = {
  en: {
    title: 'Workflows',
    description: 'Purpose-built X-AnyLabeling workflows for image, document, video, and multimodal annotation.',
    heading: 'Choose the right workflow for every task',
    lede: 'Annotate, review, and export image, document, video, and multimodal data in one workspace, with model assistance when you need it.',
    start: 'Browse workflow docs',
    browse: 'Explore all workflows',
    ariaLabel: 'X-AnyLabeling workflows',
    read: 'Read the workflow',
  },
  zh: {
    title: '工作流',
    description: '面向图像、文档、视频和多模态标注的 X-AnyLabeling 专用工作流。',
    heading: '为不同任务选择合适的工作流',
    lede: '在同一工作区完成图像、文档、视频与多模态数据的标注、审核和导出，并按需接入模型辅助。',
    start: '浏览工作流文档',
    browse: '查看全部工作流',
    ariaLabel: 'X-AnyLabeling 工作流',
    read: '查看工作流',
  },
} as const;

function ArrowIcon(): ReactNode {
  return (
    <svg className={styles.arrow} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h11.5M10.5 5l4 4-4 4" />
    </svg>
  );
}

function WorkflowRow({
  workflow,
  index,
  presentations,
  linkLabel,
}: {
  workflow: (typeof content.workflows)[number];
  index: number;
  presentations: Record<WorkflowId, WorkflowPresentation>;
  linkLabel: string;
}): ReactNode {
  const item = presentations[workflow.id];
  const image = useBaseUrl(item.image);
  return (
    <article className={styles.row}>
      <div className={`${styles.visual} ${styles[item.tone]}`}>
        <div className={styles.frame}>
          <img src={image} alt={item.imageAlt} loading="lazy" />
        </div>
      </div>
      <div className={styles.copy}>
        <p className={styles.meta}><span>{String(index + 1).padStart(2, '0')}</span>{item.eyebrow}</p>
        <Heading as="h2" id={workflow.id}>{item.title}</Heading>
        <p className={styles.description}>{item.description}</p>
        <ul>{item.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        <Link className={styles.rowLink} to={workflow.href}>{linkLabel} <ArrowIcon /></Link>
      </div>
    </article>
  );
}

export default function Workflows(): ReactNode {
  const copy = useLocalizedContent(workflowsCopy.en, workflowsCopy.zh);
  const presentations = useLocalizedContent(presentationsEn, presentationsZh);
  return (
    <Layout
      title={copy.title}
      description={copy.description}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{copy.title}</p>
          <Heading as="h1">{copy.heading}</Heading>
          <p>{copy.lede}</p>
          <div className={styles.heroLinks}>
            <Link to="/docs/x-anylabeling/image_classifier">{copy.start} <ArrowIcon /></Link>
            <Link to="#image-classifier">{copy.browse}</Link>
          </div>
        </header>

        <section className={styles.list} aria-label={copy.ariaLabel}>
          {content.workflows.map((workflow, index) => (
            <WorkflowRow
              key={workflow.id}
              workflow={workflow}
              index={index}
              presentations={presentations}
              linkLabel={copy.read}
            />
          ))}
        </section>
      </main>
    </Layout>
  );
}
