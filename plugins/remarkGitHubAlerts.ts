import type {Root} from 'mdast';
import type {Plugin} from 'unified';

type MutableNode = {
  type: string;
  children?: MutableNode[];
  value?: string;
  name?: string;
  attributes?: Record<string, string>;
};

const alertTypes = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'info',
  WARNING: 'warning',
  CAUTION: 'danger',
} as const;

type GitHubAlertType = keyof typeof alertTypes;

const alertMarker = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n)?/;

function transformNode(node: MutableNode): void {
  if (node.type === 'blockquote') {
    const firstParagraph = node.children?.[0];
    const markerNode = firstParagraph?.type === 'paragraph'
      ? firstParagraph.children?.[0]
      : undefined;
    const match = markerNode?.type === 'text' && markerNode.value
      ? alertMarker.exec(markerNode.value)
      : null;

    if (match && firstParagraph?.children && markerNode) {
      const githubType = match[1] as GitHubAlertType;
      markerNode.value = markerNode.value?.slice(match[0].length);

      if (!markerNode.value) {
        firstParagraph.children.shift();
      }
      if (firstParagraph.children.length === 0) {
        node.children?.shift();
      }

      node.type = 'containerDirective';
      node.name = alertTypes[githubType];
      node.attributes = {
        title: githubType[0] + githubType.slice(1).toLowerCase(),
        class: `github-alert github-alert-${githubType.toLowerCase()}`,
      };
    }
  }

  node.children?.forEach(transformNode);
}

const remarkGitHubAlerts: Plugin<[], Root> = () => (tree) => {
  transformNode(tree as unknown as MutableNode);
};

export default remarkGitHubAlerts;
