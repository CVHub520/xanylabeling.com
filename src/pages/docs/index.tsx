import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function DocsHome(): ReactNode {
  const quickStartUrl = useBaseUrl('/docs/x-anylabeling/get_started');
  return <Redirect to={quickStartUrl} />;
}
