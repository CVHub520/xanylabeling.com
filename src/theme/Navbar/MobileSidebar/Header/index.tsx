import React, {type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import IconClose from '@theme/Icon/Close';
import NavbarLogo from '@theme/Navbar/Logo';

export default function NavbarMobileSidebarHeader(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const {siteConfig} = useDocusaurusContext();
  const releaseLabel = siteConfig.customFields?.releaseLabel as string;

  return (
    <div className="navbar-sidebar__brand">
      <NavbarLogo />
      <NavbarColorModeToggle />
      <span className="navbar-release-link navbar-sidebar__release">{releaseLabel}</span>
      <button
        type="button"
        aria-label={translate({
          id: 'theme.docs.sidebar.closeSidebarButtonAriaLabel',
          message: 'Close navigation bar',
          description: 'The ARIA label for close button of mobile sidebar',
        })}
        className="clean-btn navbar-sidebar__close"
        onClick={() => mobileSidebar.toggle()}>
        <IconClose color="var(--ifm-color-emphasis-600)" />
      </button>
    </div>
  );
}
