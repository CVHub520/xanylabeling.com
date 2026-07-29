import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function useLocalizedContent<English, SimplifiedChinese>(
  english: English,
  simplifiedChinese: SimplifiedChinese,
): English | SimplifiedChinese {
  const {i18n} = useDocusaurusContext();
  return i18n.currentLocale === 'zh-Hans' ? simplifiedChinese : english;
}

export function useIsSimplifiedChinese(): boolean {
  const {i18n} = useDocusaurusContext();
  return i18n.currentLocale === 'zh-Hans';
}
