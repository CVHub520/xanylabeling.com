import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import FooterSocials from '@site/src/components/FooterSocials';
import type {Props} from '@theme/Footer/Layout';

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props): ReactNode {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container container-fluid">
        {links}
        {(logo || copyright) && (
          <div className="footer__bottom">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            <div className="footer__bottom-row">
              {copyright}
              <FooterSocials />
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
