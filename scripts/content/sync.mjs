import {execFileSync} from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import YAML from 'yaml';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GENERATED_ROOT = path.join(SITE_ROOT, '.generated');
const STATIC_GENERATED_ROOT = path.join(SITE_ROOT, 'static/generated');
const PRODUCTS_PATH = path.join(SITE_ROOT, 'content/products.yml');
const LOCK_PATH = path.join(SITE_ROOT, 'content/content.lock.json');
const DEFAULT_LOCALE = 'en';
const LOCALE_PREFIXES = {en: '', 'zh-Hans': '/zh-Hans'};
const LOCALE_LABELS = {en: 'English', 'zh-Hans': 'Simplified Chinese'};
const MEDIA_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.mp4',
  '.png',
  '.svg',
  '.webm',
  '.webp',
]);
const DOC_TITLES = {
  en: {
    chatbot: 'Chatbot',
    cli: 'Command Line Interface',
    configuration: 'Configuration',
    custom_model: 'Custom Models',
    faq: 'Frequently Asked Questions',
    get_started: 'Quick Start',
    image_classifier: 'Image Classifier',
    model_zoo: 'Model Zoo',
    paddle_ocr: 'PaddleOCR',
    user_guide: 'User Guide',
    video_classifier: 'Video Classifier',
    vqa: 'Visual Question Answering',
    router: 'API Reference',
  },
  'zh-Hans': {
    chatbot: '聊天机器人',
    cli: '命令行界面',
    configuration: '配置指南',
    custom_model: '自定义模型',
    faq: '常见问题',
    get_started: '快速入门',
    image_classifier: '图像分类器',
    model_zoo: '模型库',
    paddle_ocr: 'PaddleOCR',
    user_guide: '用户手册',
    video_classifier: '视频分类器',
    vqa: '视觉问答',
    router: 'API 参考',
  },
};

const OPENAPI_COPY = {
  en: {
    title: 'API Reference',
    description: 'Generated from the X-AnyLabeling-Server OpenAPI schema.',
    intro: 'This reference is generated from the FastAPI OpenAPI schema and stays aligned with the server routes and request models.',
    endpointOverview: 'Endpoint overview',
    endpoint: 'Endpoint',
    summary: 'Summary',
    parameters: 'Parameters',
    name: 'Name',
    location: 'Location',
    required: 'Required',
    type: 'Type',
    requestBody: 'Request body',
    contentType: 'Content type',
    schema: 'Schema',
    responses: 'Responses',
    status: 'Status',
    descriptionLabel: 'Description',
    schemas: 'Schemas',
    property: 'Property',
  },
  'zh-Hans': {
    title: 'API 参考',
    description: '由 X-AnyLabeling-Server OpenAPI Schema 自动生成。',
    intro: '本页由 FastAPI OpenAPI Schema 自动生成，并与服务端路由和请求模型保持同步。',
    endpointOverview: '接口概览',
    endpoint: '接口',
    summary: '说明',
    parameters: '参数',
    name: '名称',
    location: '位置',
    required: '必填',
    type: '类型',
    requestBody: '请求体',
    contentType: '内容类型',
    schema: 'Schema',
    responses: '响应',
    status: '状态码',
    descriptionLabel: '说明',
    schemas: '数据模型',
    property: '字段',
  },
};

const OPENAPI_ZH_SUMMARIES = {
  'GET /health': '健康检查',
  'GET /v1/models': '获取模型列表',
  'GET /v1/models/{model_id}/info': '获取模型详情',
  'POST /v1/predict': '执行图像推理',
  'POST /v1/video/cancel/{task_id}': '取消视频传播任务',
  'POST /v1/video/cleanup/{session_id}': '清理视频会话',
  'POST /v1/video/init': '初始化视频会话',
  'POST /v1/video/prompt': '添加视频提示',
  'POST /v1/video/propagate': '启动视频传播',
  'POST /v1/video/propagate/stream': '流式执行视频传播',
  'GET /v1/video/status/{task_id}': '获取视频传播状态',
};

function readYaml(filePath) {
  return YAML.parse(readFileSync(filePath, 'utf8'));
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function ensureDirectory(directory) {
  mkdirSync(directory, {recursive: true});
}

function writeText(filePath, content) {
  ensureDirectory(path.dirname(filePath));
  writeFileSync(filePath, content, 'utf8');
}

function relativeTo(root, target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${target} is outside ${root}`);
  }
  return relative.split(path.sep).join('/');
}

function git(args, cwd, fallback = '') {
  try {
    return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
  } catch {
    return fallback;
  }
}

function resolveLocalSource(product) {
  const environmentPath = process.env[product.local_source?.env];
  const candidates = [
    ...(environmentPath ? [environmentPath] : []),
    ...(product.local_source?.candidates ?? []).map((candidate) =>
      path.resolve(SITE_ROOT, candidate),
    ),
  ];

  for (const candidate of candidates) {
    const sourceRoot = path.resolve(candidate);
    if (existsSync(path.join(sourceRoot, product.manifest))) {
      return sourceRoot;
    }
  }
  return null;
}

function fetchLockedSource(product, lock) {
  if (!lock?.sha) {
    throw new Error(
      `No local source found for ${product.id}, and content.lock.json has no SHA`,
    );
  }
  const sourceRoot = path.join(
    SITE_ROOT,
    '.cache/content',
    product.id,
    lock.sha,
  );
  if (existsSync(path.join(sourceRoot, product.manifest))) {
    return sourceRoot;
  }

  rmSync(sourceRoot, {recursive: true, force: true});
  ensureDirectory(sourceRoot);
  execFileSync('git', ['init'], {cwd: sourceRoot, stdio: 'ignore'});
  execFileSync(
    'git',
    ['remote', 'add', 'origin', `https://github.com/${product.repository}.git`],
    {cwd: sourceRoot, stdio: 'ignore'},
  );
  execFileSync('git', ['fetch', '--depth', '1', 'origin', lock.sha], {
    cwd: sourceRoot,
    stdio: 'inherit',
  });
  execFileSync('git', ['checkout', '--detach', 'FETCH_HEAD'], {
    cwd: sourceRoot,
    stdio: 'ignore',
  });
  return sourceRoot;
}

function resolveSource(product, lock) {
  const sourceMode = process.env.CONTENT_SOURCE_MODE ?? 'auto';
  if (!['auto', 'local', 'locked'].includes(sourceMode)) {
    throw new Error(`Unsupported CONTENT_SOURCE_MODE: ${sourceMode}`);
  }

  const localRoot = sourceMode === 'locked' ? null : resolveLocalSource(product);
  if (sourceMode === 'local' && !localRoot) {
    throw new Error(`No local source found for ${product.id}`);
  }
  const sourceRoot = localRoot ?? fetchLockedSource(product, lock);
  const sha = git(['rev-parse', 'HEAD'], sourceRoot, lock?.sha ?? 'unknown');
  const dirty = Boolean(git(['status', '--short'], sourceRoot));
  return {
    root: sourceRoot,
    mode: localRoot ? 'local' : 'locked',
    sha,
    dirty,
    linkRef: localRoot && dirty ? product.ref : sha,
  };
}

function markdownFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files.sort();
}

function firstHeading(content, fallback) {
  return content.match(/^#\s+(.+)$/m)?.[1].trim() ?? fallback;
}

function plainText(value) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(content) {
  const lines = content.split(/\r?\n/);
  let fenced = false;
  let paragraph = [];

  function finishParagraph() {
    const value = plainText(paragraph.join(' '));
    paragraph = [];
    if (value.length < 40 || /:\s*$/.test(value)) return null;
    return value;
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const trimmed = line.trim();
    const excluded =
      !trimmed ||
      /^(?:[-*+]\s|\d+[.)]\s|[#>|])/.test(trimmed) ||
      /^!?\[[^\]]*\]\([^)]*\)\s*$/.test(trimmed) ||
      /^<[^>]+>/.test(trimmed) ||
      /^\|/.test(trimmed);
    if (excluded) {
      if (paragraph.length) {
        const value = finishParagraph();
        if (value) return value;
      }
      continue;
    }
    paragraph.push(trimmed);
  }
  return finishParagraph() ?? '';
}

function frontMatter(metadata, content) {
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trimStart();
  return `---\n${YAML.stringify(metadata, {lineWidth: 0}).trimEnd()}\n---\n\n${body}`;
}

function cssStyleToJsx(style) {
  const properties = style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(':');
      if (separator === -1) return null;
      const property = declaration
        .slice(0, separator)
        .trim()
        .replace(/-([a-z])/g, (_, character) => character.toUpperCase());
      const value = declaration.slice(separator + 1).trim();
      return `${property}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean);
  return `style={{${properties.join(', ')}}}`;
}

function transformOutsideFences(content, transform) {
  let fence = null;
  return content
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\s*(`{3,}|~{3,})/);
      if (match) {
        const marker = match[1][0];
        if (fence === null) fence = marker;
        else if (fence === marker) fence = null;
        return line;
      }
      return fence === null ? transform(line) : line;
    })
    .join('\n');
}

function normalizeDetailsMarkdown(content) {
  const output = [];
  const listMarker = /^(?:[-*+]\s|\d+[.)]\s)/;
  let detailsDepth = 0;
  let fence = null;

  for (const line of content.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      output.push(line);
      continue;
    }

    const trimmed = line.trim();
    const previous = output.at(-1) ?? '';
    if (
      fence === null &&
      detailsDepth > 0 &&
      previous.trim() &&
      ((/<\/summary>$/i.test(previous.trim()) && trimmed) ||
        (listMarker.test(trimmed) &&
        !listMarker.test(previous.trim()) &&
        !/^\s/.test(previous)) ||
        trimmed === '</details>')
    ) {
      output.push('');
    }
    output.push(line);
    if (/^<details\b/i.test(trimmed)) detailsDepth += 1;
    if (/^<\/details>/i.test(trimmed)) detailsDepth -= 1;
  }

  return output.join('\n');
}

function createRewriter({product, source, manifest, locale, sourceFile, outputFile}) {
  const localeEntries = Object.entries(manifest.docs.locales)
    .map(([entryLocale, relativeDirectory]) => ({
      locale: entryLocale,
      root: path.resolve(source.root, relativeDirectory),
    }))
    .sort((left, right) => right.root.length - left.root.length);
  const examplesRoot = manifest.examples?.root
    ? path.resolve(source.root, manifest.examples.root)
    : null;

  function copyAsset(assetPath) {
    const repositoryPath = relativeTo(source.root, assetPath);
    const outputPath = path.join(STATIC_GENERATED_ROOT, product.id, repositoryPath);
    ensureDirectory(path.dirname(outputPath));
    copyFileSync(assetPath, outputPath);
    return `/generated/${product.id}/${repositoryPath}`;
  }

  function rewriteTarget(rawTarget, asset = false) {
    const wrapped = rawTarget.startsWith('<') && rawTarget.endsWith('>');
    const target = wrapped ? rawTarget.slice(1, -1) : rawTarget;
    if (
      !target ||
      target.startsWith('#') ||
      target.startsWith('/') ||
      /^(?:data|https?|mailto|tel):/i.test(target)
    ) {
      return rawTarget;
    }

    const hashIndex = target.indexOf('#');
    const queryIndex = target.indexOf('?');
    const boundary = [hashIndex, queryIndex]
      .filter((index) => index >= 0)
      .reduce((minimum, index) => Math.min(minimum, index), target.length);
    const pathname = decodeURIComponent(target.slice(0, boundary));
    const suffix = target.slice(boundary);
    const resolved = path.resolve(path.dirname(sourceFile), pathname);
    const repositoryPath = relativeTo(source.root, resolved);
    if (!existsSync(resolved)) {
      throw new Error(`Missing local target in ${repositoryPath}: ${rawTarget}`);
    }

    for (const entry of localeEntries) {
      const relativeDocument = path.relative(entry.root, resolved);
      if (
        !relativeDocument.startsWith('..') &&
        !path.isAbsolute(relativeDocument) &&
        relativeDocument.endsWith('.md')
      ) {
        const relativeSource = path.relative(entry.root, sourceFile);
        const sourceIsInLocale =
          !relativeSource.startsWith('..') && !path.isAbsolute(relativeSource);
        if (entry.locale === locale && sourceIsInLocale) {
          const generatedTarget = path.resolve(
            path.dirname(outputFile),
            path.relative(path.dirname(sourceFile), resolved),
          );
          let relativeTarget = path.relative(path.dirname(outputFile), generatedTarget);
          relativeTarget = relativeTarget.split(path.sep).join('/');
          if (!relativeTarget.startsWith('.')) relativeTarget = `./${relativeTarget}`;
          return `${relativeTarget}${suffix}`;
        }
        const docPath = relativeDocument.replace(/\.md$/, '').split(path.sep).join('/');
        const route = `${product.docs_route ?? `/docs/${product.id}`}/${docPath}${suffix}`;
        if (entry.locale === locale) return route;
        return `pathname://${LOCALE_PREFIXES[entry.locale] ?? ''}${route}`;
      }
    }

    const relativeExample = examplesRoot ? path.relative(examplesRoot, resolved) : null;
    if (
      relativeExample !== null &&
      !relativeExample.startsWith('..') &&
      !path.isAbsolute(relativeExample) &&
      path.basename(resolved).toLowerCase() === 'readme.md'
    ) {
      const slug = path.dirname(relativeExample).split(path.sep).join('/');
      return `${LOCALE_PREFIXES[locale] ?? ''}/examples/${slug}${suffix}`;
    }

    if (asset || MEDIA_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
      return `${copyAsset(resolved)}${suffix}`;
    }

    const kind = statSync(resolved).isDirectory() ? 'tree' : 'blob';
    return `https://github.com/${product.repository}/${kind}/${source.linkRef}/${repositoryPath}${suffix}`;
  }

  function rewrite(content) {
    const normalized = normalizeDetailsMarkdown(content).replace(
      /<summary\b([^>]*)>(?![^\n]*<\/summary>)([^\n]*)\n+([\s\S]*?)\n*<\/summary>/gi,
      (_, attributes, summary, body) =>
        `<summary${attributes}>${summary.trim()}</summary>\n\n${body.trim()}`,
    );
    const rewritten = transformOutsideFences(normalized, (line) => {
      let output = line.replace(
        /(!?\[[^\]]*\]\()(<[^>]+>|[^\s)]+)([^)]*\))/g,
        (match, prefix, target, suffix) =>
          `${prefix}${rewriteTarget(target, prefix.startsWith('!'))}${suffix}`,
      );
      output = output.replace(
        /\b(src|href)=(['"])([^'"]+)\2/gi,
        (match, attribute, quote, target) =>
          `${attribute}=${quote}${rewriteTarget(target, attribute.toLowerCase() === 'src')}${quote}`,
      );
      output = output.replace(
        /(<summary\b[^>]*>)(.*)(<\/summary>)/gi,
        (_, opening, body, closing) =>
          `${opening}${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}${closing}`,
      );
      output = output
        .replace(/style="([^"]*)"/gi, (_, style) => cssStyleToJsx(style))
        .replace(/\bautoplay\b/gi, 'autoPlay')
        .replace(/\bplaysinline\b/gi, 'playsInline')
        .replace(/\bclass=/gi, 'className=')
        .replace(/<\/br\s*>/gi, '<br />')
        .replace(/<br\s*\/?>/gi, '<br />')
        .replace(/<img\b([^>]*?)(?<!\/)\s*>/gi, '<img$1 />');
      return output;
    });
    return rewritten.replace(
      /<p\s+align=(['"])(left|center|right)\1>([\s\S]*?)<\/p>/gi,
      (_, _quote, alignment, body) =>
        `<div style={{textAlign: ${JSON.stringify(alignment)}}}>${body}</div>`,
    );
  }

  return {copyAsset, rewrite, rewriteTarget};
}

function generatedDocsDirectory(product, locale) {
  const pluginId = product.docs_plugin_id ?? product.id;
  const subdirectory = product.docs_subdir ?? '';
  let root;
  if (locale === DEFAULT_LOCALE) {
    root = path.join(GENERATED_ROOT, 'docs', pluginId, locale);
  } else {
    root = path.join(
      SITE_ROOT,
      'i18n',
      locale,
      `docusaurus-plugin-content-docs-${pluginId}`,
      'current',
    );
  }
  return subdirectory ? path.join(root, subdirectory) : root;
}

function generatedExamplesDirectory(productId, locale) {
  if (locale === DEFAULT_LOCALE) {
    return path.join(GENERATED_ROOT, 'examples', productId, locale);
  }
  return path.join(
    SITE_ROOT,
    'i18n',
    locale,
    'docusaurus-plugin-content-docs-examples',
    'current',
  );
}

function generateDocs(product, source, manifest) {
  let count = 0;
  const documentsByLocale = new Map();
  const localeRoots = Object.entries(manifest.docs.locales)
    .map(([locale, relativeDirectory]) => ({
      locale,
      root: path.resolve(source.root, relativeDirectory),
    }))
    .sort((left, right) => right.root.length - left.root.length);
  for (const [locale, relativeDirectory] of Object.entries(manifest.docs.locales)) {
    const sourceDirectory = path.resolve(source.root, relativeDirectory);
    const outputDirectory = generatedDocsDirectory(product, locale);
    if (!existsSync(sourceDirectory)) {
      throw new Error(`Missing docs directory: ${sourceDirectory}`);
    }
    const documents = markdownFiles(sourceDirectory)
      .filter((sourceFile) => {
        const owner = localeRoots.find(({root}) => {
          const relative = path.relative(root, sourceFile);
          return !relative.startsWith('..') && !path.isAbsolute(relative);
        });
        return owner?.locale === locale;
      })
      .map((sourceFile) => ({
        sourceFile,
        relativeDocument: path.relative(sourceDirectory, sourceFile),
      }));
    documentsByLocale.set(locale, documents);
    for (const {sourceFile, relativeDocument} of documents) {
      const outputFile = path.join(outputDirectory, relativeDocument);
      const id = relativeDocument.replace(/\.md$/, '').split(path.sep).join('/');
      const sourceContent = readFileSync(sourceFile, 'utf8');
      const title = DOC_TITLES[locale]?.[id] ?? firstHeading(sourceContent, id);
      const description = firstParagraph(sourceContent);
      const rewriter = createRewriter({
        product,
        source,
        manifest,
        locale,
        sourceFile,
        outputFile,
      });
      const normalized = rewriter.rewrite(sourceContent);
      const localizedContent =
        product.id === 'server' && id === 'router'
          ? normalized.replace(/^#\s+.+$/m, `# ${title}`)
          : normalized;
      writeText(
        outputFile,
        frontMatter(
          {
            title,
            sidebar_label: title,
            description,
            custom_edit_url: `https://github.com/${product.repository}/edit/${product.ref}/${relativeTo(source.root, sourceFile)}`,
          },
          localizedContent,
        ),
      );
      count += 1;
    }
  }

  const defaultDocuments = new Set(
    (documentsByLocale.get(DEFAULT_LOCALE) ?? []).map(
      ({relativeDocument}) => relativeDocument,
    ),
  );
  for (const [locale, documents] of documentsByLocale) {
    if (locale === DEFAULT_LOCALE) continue;
    for (const {sourceFile, relativeDocument} of documents) {
      if (defaultDocuments.has(relativeDocument)) continue;
      defaultDocuments.add(relativeDocument);
      const id = relativeDocument.replace(/\.md$/, '').split(path.sep).join('/');
      const title = DOC_TITLES[DEFAULT_LOCALE]?.[id] ?? titleCase(id);
      const localeLabel = LOCALE_LABELS[locale] ?? locale;
      writeText(
        path.join(
          generatedDocsDirectory(product, DEFAULT_LOCALE),
          relativeDocument,
        ),
        frontMatter(
          {
            title,
            sidebar_label: title,
            description: `This document is currently maintained in ${localeLabel}.`,
            custom_edit_url: `https://github.com/${product.repository}/edit/${product.ref}/${relativeTo(source.root, sourceFile)}`,
          },
          `This document is currently maintained in ${localeLabel}. Use the language selector in the navigation bar to read it.\n`,
        ),
      );
    }
  }
  return count;
}

function sidebarDocumentIds(entries, context) {
  const ids = [];
  for (const entry of entries ?? []) {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Invalid sidebar entry in ${context}`);
    }
    if (typeof entry.local === 'string') ids.push(entry.local);
    if (entry.sections !== undefined) {
      if (!Array.isArray(entry.sections) || typeof entry.title !== 'string') {
        throw new Error(`Invalid sidebar section in ${context}`);
      }
      ids.push(...sidebarDocumentIds(entry.sections, context));
    }
  }
  return ids;
}

function docusaurusSidebarItems(entries, context) {
  return entries.map((entry) => {
    if (typeof entry.local === 'string') return entry.local;
    if (Array.isArray(entry.sections) && typeof entry.title === 'string') {
      return {
        type: 'category',
        label: entry.title,
        collapsed: entry.isExpanded === false,
        items: docusaurusSidebarItems(entry.sections, context),
      };
    }
    throw new Error(`Invalid sidebar entry in ${context}`);
  });
}

function generateSidebar(product, source, manifest) {
  const sidebarFiles = manifest.docs.sidebars;
  if (!sidebarFiles) return;

  const trees = new Map();
  for (const [locale, relativeFile] of Object.entries(sidebarFiles)) {
    const sidebarFile = path.resolve(source.root, relativeFile);
    if (!existsSync(sidebarFile)) {
      throw new Error(`Missing sidebar file: ${sidebarFile}`);
    }
    const tree = readYaml(sidebarFile);
    if (!Array.isArray(tree)) {
      throw new Error(`Sidebar must be a list: ${sidebarFile}`);
    }
    const ids = sidebarDocumentIds(tree, relativeFile);
    if (new Set(ids).size !== ids.length) {
      throw new Error(`Duplicate document in sidebar: ${relativeFile}`);
    }
    trees.set(locale, {tree, ids});
  }

  const defaultTree = trees.get(manifest.default_locale ?? DEFAULT_LOCALE);
  if (!defaultTree) {
    throw new Error(`Missing default sidebar for ${product.id}`);
  }
  for (const [locale, {ids}] of trees) {
    if (ids.join('\n') !== defaultTree.ids.join('\n')) {
      throw new Error(
        `Sidebar structure for ${product.id}/${locale} does not match the default locale`,
      );
    }
  }

  const docsRoot = path.resolve(
    source.root,
    manifest.docs.locales[manifest.default_locale ?? DEFAULT_LOCALE],
  );
  const availableIds = new Set(
    markdownFiles(docsRoot).map((file) =>
      path.relative(docsRoot, file).replace(/\.md$/, '').split(path.sep).join('/'),
    ),
  );
  if (manifest.openapi) availableIds.add('api-reference');
  for (const id of defaultTree.ids) {
    if (!availableIds.has(id)) {
      throw new Error(`Sidebar references missing document: ${product.id}/${id}`);
    }
  }

  writeText(
    path.join(GENERATED_ROOT, 'sidebars', `${product.id}.json`),
    `${JSON.stringify(
      {
        docsSidebar: docusaurusSidebarItems(
          defaultTree.tree,
          sidebarFiles[manifest.default_locale ?? DEFAULT_LOCALE],
        ),
      },
      null,
      2,
    )}\n`,
  );
}

function titleCase(value) {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function exampleReadmes(root) {
  return markdownFiles(root).filter(
    (filePath) => path.basename(filePath).toLowerCase() === 'readme.md',
  );
}

function firstImageTarget(content) {
  const markdownImage = content.match(/!\[[^\]]*\]\((<[^>]+>|[^\s)]+)[^)]*\)/);
  const htmlImage = content.match(/<img\b[^>]*\bsrc=['"]([^'"]+)['"]/i);
  return markdownImage?.[1] ?? htmlImage?.[1] ?? null;
}

function readExampleMetadata(directory) {
  const metadataPath = path.join(directory, 'example.yml');
  return existsSync(metadataPath) ? readYaml(metadataPath) : {};
}

function generateExamples(product, source, manifest) {
  if (!manifest.examples?.root) return [];
  const examplesRoot = path.resolve(source.root, manifest.examples.root);
  const items = [];
  for (const sourceFile of exampleReadmes(examplesRoot)) {
    const relativeReadme = path.relative(examplesRoot, sourceFile);
    const slug = path.dirname(relativeReadme).split(path.sep).join('/');
    const outputRelative = `${slug}.md`;
    const sourceContent = readFileSync(sourceFile, 'utf8');
    const metadata = readExampleMetadata(path.dirname(sourceFile));
    const title = metadata.title ?? firstHeading(sourceContent, titleCase(path.basename(slug)));
    const description = metadata.description ?? firstParagraph(sourceContent);
    const defaultOutputFile = path.join(
      generatedExamplesDirectory(product.id, DEFAULT_LOCALE),
      outputRelative,
    );
    const rewriter = createRewriter({
      product,
      source,
      manifest,
      locale: DEFAULT_LOCALE,
      sourceFile,
      outputFile: defaultOutputFile,
    });
    const normalized = rewriter.rewrite(sourceContent);
    const editUrl = `https://github.com/${product.repository}/edit/${product.ref}/${relativeTo(source.root, sourceFile)}`;
    writeText(
      defaultOutputFile,
      frontMatter(
        {
          title,
          description,
          custom_edit_url: editUrl,
        },
        normalized,
      ),
    );

    for (const locale of Object.keys(manifest.docs.locales).filter(
      (entry) => entry !== DEFAULT_LOCALE,
    )) {
      const outputFile = path.join(
        generatedExamplesDirectory(product.id, locale),
        outputRelative,
      );
      const localeRewriter = createRewriter({
        product,
        source,
        manifest,
        locale,
        sourceFile,
        outputFile,
      });
      const notice =
        locale === 'zh-Hans'
          ? '> **翻译状态：** 此任务示例目前仅提供英文版本。\n\n'
          : '> **Translation status:** This task example is currently maintained in English.\n\n';
      writeText(
        outputFile,
        frontMatter(
          {
            title,
            description,
            custom_edit_url: editUrl,
          },
          notice + localeRewriter.rewrite(sourceContent),
        ),
      );
    }

    const coverTarget = metadata.cover ?? firstImageTarget(sourceContent);
    let cover = null;
    if (coverTarget && !/\.gif(?:$|[?#])/i.test(coverTarget)) {
      cover = rewriter.rewriteTarget(coverTarget, true);
    }
    items.push({
      id: slug,
      category: titleCase(slug.split('/')[0]),
      title,
      description,
      cover,
      href: `/examples/${slug}`,
      sourceUrl: `https://github.com/${product.repository}/blob/${source.linkRef}/${relativeTo(source.root, sourceFile)}`,
    });
  }
  return items;
}

function cleanGeneratedContent(products) {
  rmSync(GENERATED_ROOT, {recursive: true, force: true});
  rmSync(STATIC_GENERATED_ROOT, {recursive: true, force: true});
  for (const product of products) {
    for (const locale of Object.keys(LOCALE_PREFIXES).filter(
      (entry) => entry !== DEFAULT_LOCALE,
    )) {
      rmSync(generatedDocsDirectory(product, locale), {
        recursive: true,
        force: true,
      });
      if (product.docs_plugin_id && product.docs_plugin_id !== product.id) {
        rmSync(
          path.join(
            SITE_ROOT,
            'i18n',
            locale,
            `docusaurus-plugin-content-docs-${product.id}`,
            'current',
          ),
          {recursive: true, force: true},
        );
      }
    }
  }
  for (const locale of Object.keys(LOCALE_PREFIXES).filter(
    (entry) => entry !== DEFAULT_LOCALE,
  )) {
    rmSync(generatedExamplesDirectory('x-anylabeling', locale), {
      recursive: true,
      force: true,
    });
  }
}

function schemaType(schema = {}) {
  if (schema.$ref) return schema.$ref.split('/').at(-1);
  if (schema.anyOf) return schema.anyOf.map(schemaType).join(' / ');
  if (schema.oneOf) return schema.oneOf.map(schemaType).join(' / ');
  if (schema.allOf) return schema.allOf.map(schemaType).join(' & ');
  if (schema.type === 'array') return `${schemaType(schema.items)}[]`;
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' / ');
  return [schema.type ?? 'object', schema.format].filter(Boolean).join(' · ');
}

function responseSchema(response) {
  const content = response?.content ?? {};
  const entry = Object.values(content)[0];
  return entry?.schema ? schemaType(entry.schema) : '—';
}

function cleanOpenApiText(value) {
  if (!value) return '';
  return value
    .split(/\n\s*(?:Args|Returns):/)[0]
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function operationSummary(locale, route, method, operation) {
  const key = `${method.toUpperCase()} ${route}`;
  if (locale === 'zh-Hans' && OPENAPI_ZH_SUMMARIES[key]) {
    return OPENAPI_ZH_SUMMARIES[key];
  }
  return cleanOpenApiText(operation.summary ?? operation.description) || '—';
}

function generateOpenApiReference(product, source, manifest) {
  if (!manifest.openapi || product.generate_openapi_reference === false) return 0;
  const sourceFile = path.resolve(source.root, manifest.openapi);
  if (!existsSync(sourceFile)) {
    throw new Error(`Missing OpenAPI schema: ${sourceFile}`);
  }
  const schema = readJson(sourceFile);
  const operations = [];
  for (const [route, pathItem] of Object.entries(schema.paths ?? {})) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
      if (pathItem[method]) operations.push({route, method, operation: pathItem[method]});
    }
  }
  operations.sort((left, right) =>
    left.route.localeCompare(right.route) || left.method.localeCompare(right.method),
  );

  for (const locale of Object.keys(manifest.docs.locales)) {
    const copy = OPENAPI_COPY[locale] ?? OPENAPI_COPY.en;
    const yes = locale === 'zh-Hans' ? '是' : 'Yes';
    const no = locale === 'zh-Hans' ? '否' : 'No';
    const lines = [
      copy.intro,
      '',
      `## ${copy.endpointOverview}`,
      '',
      `| ${copy.endpoint} | ${copy.summary} |`,
      '| --- | --- |',
    ];
    for (const {route, method, operation} of operations) {
      lines.push(`| \`${method.toUpperCase()} ${route}\` | ${operationSummary(locale, route, method, operation)} |`);
    }
    for (const {route, method, operation} of operations) {
      lines.push('', `## \`${method.toUpperCase()} ${route}\``, '');
      const summary = operationSummary(locale, route, method, operation);
      if (summary !== '—') lines.push(`**${summary}**`, '');
      const description = cleanOpenApiText(operation.description);
      if (locale !== 'zh-Hans' && description && description !== summary) {
        lines.push(description, '');
      }
      const parameters = operation.parameters ?? [];
      if (parameters.length) {
        lines.push(
          `### ${copy.parameters}`,
          '',
          `| ${copy.name} | ${copy.location} | ${copy.required} | ${copy.type} | ${copy.descriptionLabel} |`,
          '| --- | --- | --- | --- | --- |',
        );
        for (const parameter of parameters) {
          lines.push(`| \`${parameter.name}\` | ${parameter.in} | ${parameter.required ? yes : no} | \`${schemaType(parameter.schema)}\` | ${cleanOpenApiText(parameter.description) || '—'} |`);
        }
        lines.push('');
      }
      const requestContent = operation.requestBody?.content ?? {};
      if (Object.keys(requestContent).length) {
        lines.push(
          `### ${copy.requestBody}`,
          '',
          `| ${copy.contentType} | ${copy.schema} |`,
          '| --- | --- |',
        );
        for (const [contentType, value] of Object.entries(requestContent)) {
          lines.push(`| \`${contentType}\` | \`${schemaType(value.schema)}\` |`);
        }
        lines.push('');
      }
      lines.push(
        `### ${copy.responses}`,
        '',
        `| ${copy.status} | ${copy.descriptionLabel} | ${copy.schema} |`,
        '| --- | --- | --- |',
      );
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        lines.push(`| \`${status}\` | ${cleanOpenApiText(response.description) || '—'} | \`${responseSchema(response)}\` |`);
      }
    }

    lines.push('', `## ${copy.schemas}`);
    for (const [name, component] of Object.entries(schema.components?.schemas ?? {}).sort()) {
      lines.push('', `### ${name}`, '');
      if (locale !== 'zh-Hans' && component.description) {
        lines.push(cleanOpenApiText(component.description), '');
      }
      const required = new Set(component.required ?? []);
      lines.push(
        `| ${copy.property} | ${copy.type} | ${copy.required} | ${copy.descriptionLabel} |`,
        '| --- | --- | --- | --- |',
      );
      for (const [property, definition] of Object.entries(component.properties ?? {})) {
        lines.push(`| \`${property}\` | \`${schemaType(definition)}\` | ${required.has(property) ? yes : no} | ${cleanOpenApiText(definition.description) || '—'} |`);
      }
    }

    const outputFile = path.join(
      generatedDocsDirectory(product, locale),
      'api-reference.md',
    );
    writeText(
      outputFile,
      frontMatter(
        {
          title: copy.title,
          sidebar_label: copy.title,
          description: copy.description,
          custom_edit_url: `https://github.com/${product.repository}/blob/${source.linkRef}/${relativeTo(source.root, sourceFile)}`,
        },
        `${lines.join('\n')}\n`,
      ),
    );
  }
  return Object.keys(manifest.docs.locales).length;
}

function main() {
  const registry = readYaml(PRODUCTS_PATH);
  const lock = readJson(LOCK_PATH);
  const entries = registry.products.map((product) => {
    const source = resolveSource(product, lock.sources[product.id]);
    const manifest = readYaml(path.join(source.root, product.manifest));
    if (manifest.schema_version !== 1 || manifest.product_id !== product.id) {
      throw new Error(`Unsupported manifest: ${product.manifest}`);
    }
    return {product, source, manifest};
  });
  cleanGeneratedContent(registry.products);

  let xAnyLabelingData = null;
  const productData = [];
  for (const {product, source, manifest} of entries) {
    const documentCount =
      generateDocs(product, source, manifest) +
      generateOpenApiReference(product, source, manifest);
    generateSidebar(product, source, manifest);
    const examples = generateExamples(product, source, manifest);
    const workflows = (manifest.workflows ?? []).map((workflow) => ({
      ...workflow,
      href: `/docs/${product.id}/${workflow.document.replace(/\.md$/, '')}`,
    }));
    const summary = {
      product: {
        id: product.id,
        name: product.name,
        repository: product.repository,
      },
      source: {
        mode: source.mode,
        sha: source.sha,
        dirty: source.dirty,
      },
      documents: documentCount,
    };
    productData.push(summary);
    if (product.id === 'x-anylabeling') {
      xAnyLabelingData = {...summary, examples, workflows};
    }
    console.log(
      `Synced ${documentCount} localized docs${examples.length ? `, ${examples.length} examples` : ''}${workflows.length ? `, and ${workflows.length} workflows` : ''} from ${product.name} ${source.mode} source ${source.sha}${source.dirty ? ' (dirty)' : ''}`,
    );
  }
  if (!xAnyLabelingData) {
    throw new Error('products.yml does not register x-anylabeling');
  }
  writeText(
    path.join(GENERATED_ROOT, 'data/x-anylabeling.json'),
    `${JSON.stringify(xAnyLabelingData, null, 2)}\n`,
  );
  writeText(
    path.join(GENERATED_ROOT, 'data/products.json'),
    `${JSON.stringify(productData, null, 2)}\n`,
  );
}

main();
