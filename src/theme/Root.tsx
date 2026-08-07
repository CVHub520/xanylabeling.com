import React from 'react';

import {GitHubStarsProvider} from '../components/GitHubStars';

export default function Root({children}: {children: React.ReactNode}): React.ReactElement {
  return <GitHubStarsProvider>{children}</GitHubStarsProvider>;
}
