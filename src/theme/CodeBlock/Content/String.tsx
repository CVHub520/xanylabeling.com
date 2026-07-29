import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {
  CodeBlockContextProvider,
  type CodeBlockMetadata,
  createCodeBlockMetadata,
} from '@docusaurus/theme-common/internal';
import type {Props} from '@theme/CodeBlock/Content/String';
import CodeBlockLayout from '@theme/CodeBlock/Layout';

function useCodeBlockMetadata(props: Props): CodeBlockMetadata {
  const {prism} = useThemeConfig();
  return createCodeBlockMetadata({
    code: props.children,
    className: props.className,
    metastring: props.metastring,
    magicComments: prism.magicComments,
    defaultLanguage: prism.defaultLanguage,
    language: props.language,
    title: props.title,
    showLineNumbers: props.showLineNumbers,
  });
}

function useDefaultWordWrap() {
  const codeBlockRef = useRef<HTMLPreElement>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const codeElement = codeBlockRef.current?.querySelector('code');
    if (!codeElement) return;

    codeElement.style.whiteSpace = isEnabled ? 'pre-wrap' : 'pre';
    codeElement.style.overflowWrap = isEnabled ? 'anywhere' : 'normal';
  }, [isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled((value) => !value);
  }, []);

  return useMemo(
    () => ({
      codeBlockRef,
      isEnabled,
      isCodeScrollable: true,
      toggle,
    }),
    [isEnabled, toggle],
  );
}

export default function CodeBlockString(props: Props): ReactNode {
  const metadata = useCodeBlockMetadata(props);
  const wordWrap = useDefaultWordWrap();

  return (
    <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
      <CodeBlockLayout />
    </CodeBlockContextProvider>
  );
}
