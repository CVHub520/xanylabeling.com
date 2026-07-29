import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type LinkSocial = {
  name: string;
  icon: string;
  href: string;
};

type QrSocial = {
  name: string;
  icon: string;
  qr: string;
};

type Social = LinkSocial | QrSocial;

const socials: Social[] = [
  {
    name: 'GitHub',
    icon: 'github',
    href: 'https://github.com/CVHub520/X-AnyLabeling',
  },
  {
    name: 'X',
    icon: 'x',
    href: 'https://x.com/xanylabeling',
  },
  {
    name: 'YouTube',
    icon: 'youtube',
    href: 'https://youtube.com/@x-anylabeling?si=P9MPRmgTzXcJg8Rr',
  },
  {
    name: 'WeChat',
    icon: 'wechat',
    qr: 'wechat.jpg',
  },
  {
    name: 'Rednote',
    icon: 'rednote',
    qr: 'rednote.jpg',
  },
  {
    name: 'Douyin',
    icon: 'douyin',
    qr: 'douyin.jpg',
  },
  {
    name: 'Bilibili',
    icon: 'bilibili',
    href: 'https://space.bilibili.com/3493129615313789?spm_id_from=333.1007.0.0',
  },
  {
    name: 'Reddit',
    icon: 'reddit',
    href: 'https://www.reddit.com/u/Important_Priority76/s/oKAPN2XCtP',
  },
  {
    name: 'Discord',
    icon: 'discord',
    href: 'https://discord.com/channels/1350265627142651994/1350265628832829514',
  },
];

function SocialIcon({icon}: {icon: string}) {
  const src = useBaseUrl(`/img/social/icons/${icon}.svg`);
  return <img className={styles.icon} src={src} alt="" aria-hidden="true" />;
}

function QrItem({social}: {social: QrSocial}) {
  const qrSrc = useBaseUrl(`/img/social/qr/${social.qr}`);
  const popoverId = `footer-${social.icon}-qr`;

  return (
    <span className={styles.item}>
      <button
        className={styles.iconButton}
        type="button"
        aria-label={`Follow X-AnyLabeling on ${social.name}`}
        aria-describedby={popoverId}>
        <SocialIcon icon={social.icon} />
      </button>
      <span className={styles.popover} id={popoverId} role="tooltip">
        <img
          className={styles.qr}
          src={qrSrc}
          alt={`${social.name} QR code`}
          loading="lazy"
        />
        <span className={styles.caption}>
          Follow X-AnyLabeling on {social.name}.
        </span>
      </span>
    </span>
  );
}

export default function FooterSocials() {
  return (
    <nav className={styles.socials} aria-label="X-AnyLabeling social media">
      {socials.map((social) =>
        'href' in social ? (
          <a
            className={styles.iconLink}
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`X-AnyLabeling on ${social.name}`}
            title={social.name}>
            <SocialIcon icon={social.icon} />
          </a>
        ) : (
          <QrItem key={social.name} social={social} />
        ),
      )}
    </nav>
  );
}
