import React, {type ReactNode} from 'react';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

import {useGitHubStarsLabel} from '../../components/GitHubStars';

export default function GitHubStarsNavbarItem({
  label,
  ...props
}: DefaultNavbarItemProps): ReactNode {
  const liveLabel = useGitHubStarsLabel(label);
  return <DefaultNavbarItem {...props} label={liveLabel} />;
}
