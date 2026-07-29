import {useMemo, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';

import content from '../../../.generated/data/x-anylabeling.json';
import {useLocalizedContent} from '../../utils/useLocalizedContent';
import styles from './examples.module.css';

type Example = (typeof content.examples)[number];

const taskCoverById: Record<string, string> = {
  'classification/image-level': '/img/task-covers/image-level-classification.webp',
  'classification/shape-level': '/img/task-covers/shape-level-classification.webp',
  'counting/geco': '/img/task-covers/geco-counting.webp',
  'counting/geco2': '/img/task-covers/geco2-counting.webp',
  'description/captioning': '/img/task-covers/image-captioning.webp',
  'description/tagging': '/img/task-covers/tagging-annotation.webp',
  'detection/hbb': '/img/task-covers/object-detection.webp',
  'detection/obb': '/img/task-covers/oriented-object-detection.webp',
  'estimation/depth_estimation': '/img/task-covers/depth-estimation.webp',
  'estimation/face_estimation': '/img/task-covers/face-estimation.webp',
  'estimation/pose_estimation': '/img/task-covers/pose-estimation.webp',
  'grounding/locateanything': '/img/task-covers/locate-anything-grounding.webp',
  'grounding/sam3': '/img/task-covers/sam3-concept-segmentation.webp',
  'grounding/yoloe': '/img/task-covers/yoloe-universal-detection.webp',
  'interactive_video_object_segmentation/sam2': '/img/task-covers/sam2-video-segmentation.webp',
  'interactive_video_object_segmentation/sam3': '/img/task-covers/sam3-video-segmentation.webp',
  'matting/image_matting': '/img/task-covers/image-matting.webp',
  'multiple_object_tracking': '/img/task-covers/multi-object-tracking.webp',
  'optical_character_recognition/document_layout_analysis': '/img/task-covers/document-layout.webp',
  'optical_character_recognition/key_information_extraction': '/img/task-covers/key-information-extraction.webp',
  'optical_character_recognition/multi_task': '/img/task-covers/paddleocr-vl-multitask.webp',
  'optical_character_recognition/text_recognition': '/img/task-covers/text-recognition.webp',
  'segmentation': '/img/task-covers/image-segmentation.webp',
  'training/ultralytics': '/img/task-covers/training.webp',
  'vision_language/florence2': '/img/task-covers/florence2.webp',
  'vision_language/rexomni': '/img/task-covers/rex-omni.webp',
};

const taskTitleById: Record<string, string> = {
  'detection/obb': 'Oriented Object Detection',
  'grounding/locateanything': 'LocateAnything',
  'grounding/sam3': 'SAM 3',
  'grounding/yoloe': 'YOLOE',
  'interactive_video_object_segmentation/sam2': 'SAM 2 Video Segmentation',
  'interactive_video_object_segmentation/sam3': 'SAM 3 Video Segmentation',
  'training/ultralytics': 'Model Training',
};

const examplesCopy = {
  en: {
    title: 'Task examples',
    description: 'Explore real annotation tasks and end-to-end examples from X-AnyLabeling.',
    eyebrow: 'Task library',
    heading: 'Start from a real labeling task.',
    lede: 'Start with a real task and quickly learn how to configure the model and complete the annotation workflow.',
    maintained: 'maintained examples',
    viewSource: 'View source',
    filterLabel: 'Filter examples by task',
    openGuide: 'Open task guide',
    all: 'All',
    categories: {} as Record<string, string>,
  },
  zh: {
    title: '任务示例',
    description: '探索 X-AnyLabeling 的真实标注任务与端到端示例。',
    eyebrow: '任务库',
    heading: '从真实的标注任务开始。',
    lede: '从任务场景出发，快速掌握模型配置与数据标注流程。',
    maintained: '个持续维护的示例',
    viewSource: '查看源码',
    filterLabel: '按任务类型筛选示例',
    openGuide: '打开任务指南',
    all: '全部',
    categories: {
      Classification: '分类',
      Counting: '计数',
      Description: '描述',
      Detection: '检测',
      Estimation: '估计',
      Grounding: '开放词汇定位',
      'Interactive Video Object Segmentation': '交互式视频目标分割',
      Matting: '图像抠图',
      'Multiple Object Tracking': '多目标跟踪',
      'Optical Character Recognition': '光学字符识别',
      Segmentation: '分割',
      Training: '训练',
      'Vision Language': '视觉语言',
    },
  },
};

function ArrowIcon(): ReactNode {
  return (
    <svg className={styles.arrow} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h11.5M10.5 5l4 4-4 4" />
    </svg>
  );
}

function getTaskTitle(example: Example): string {
  return taskTitleById[example.id] ?? example.title.replace(/\s+Example$/i, '');
}

function ExampleCard({
  example,
  categoryLabel,
  openLabel,
}: {
  example: Example;
  categoryLabel: string;
  openLabel: string;
}): ReactNode {
  const {withBaseUrl} = useBaseUrlUtils();
  const cover = taskCoverById[example.id] ?? example.cover;
  return (
    <Link className={styles.card} to={example.href}>
      <div className={styles.media}>
        {cover ? (
          <img src={withBaseUrl(cover)} alt="" loading="lazy" />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span>{example.category.slice(0, 2)}</span>
            <i /><i /><i />
          </div>
        )}
      </div>
      <div className={styles.cardCopy}>
        <p className={styles.category}>{categoryLabel}</p>
        <Heading as="h2">{getTaskTitle(example)}</Heading>
        <p className={styles.description}>{example.description}</p>
        <span className={styles.open}>{openLabel} <ArrowIcon /></span>
      </div>
    </Link>
  );
}

export default function Examples(): ReactNode {
  const copy = useLocalizedContent(examplesCopy.en, examplesCopy.zh);
  const categoryLabels: Record<string, string> = copy.categories;
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(content.examples.map((item) => item.category)))],
    [],
  );
  const [activeCategory, setActiveCategory] = useState('All');
  const examples = activeCategory === 'All'
    ? content.examples
    : content.examples.filter((item) => item.category === activeCategory);

  return (
    <Layout
      title={copy.title}
      description={copy.description}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <Heading as="h1">{copy.heading}</Heading>
            <p className={styles.lede}>{copy.lede}</p>
          </div>
          <div className={styles.sourceMeta}>
            <strong>{content.examples.length}</strong>
            <span>{copy.maintained}</span>
            <Link to="https://github.com/CVHub520/X-AnyLabeling/tree/main/examples">{copy.viewSource} <ArrowIcon /></Link>
          </div>
        </header>

        <nav className={styles.filters} aria-label={copy.filterLabel}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? styles.activeFilter : undefined}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}>
              {category === 'All' ? copy.all : (categoryLabels[category] ?? category)}
            </button>
          ))}
        </nav>

        <section className={styles.grid} aria-live="polite">
          {examples.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              categoryLabel={categoryLabels[example.category] ?? example.category}
              openLabel={copy.openGuide}
            />
          ))}
        </section>
      </main>
    </Layout>
  );
}
