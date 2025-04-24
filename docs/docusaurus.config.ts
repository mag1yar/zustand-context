import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const organizationName = 'mag1yar';
const projectName = 'zustand-context';

const config: Config = {
  title: 'Zustand Context',
  tagline:
    'Zustand Context is a small and simple library that provides a way to use Zustand with React Context.',
  favicon: 'img/favicon.ico',

  url: `https://${organizationName}.github.io`,
  baseUrl: `/${projectName}/`,

  organizationName,
  projectName,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/docs/`,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    metadata: [
      {
        name: 'keywords',
        content: 'react, state management, zustand, context, react context, react hooks',
      },
      {
        name: 'description',
        content:
          'Context-aware state management built on top of Zustand. Create multiple instances of the same store with hierarchical state inheritance and component-scoped state.',
      },
      { name: 'author', content: organizationName },
    ],

    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Zustand Context',
      // logo: {
      //   alt: 'Zustand Context Logo',
      //   src: 'img/logo.svg',
      // },
      items: [
        {
          href: `https://github.com/${organizationName}/${projectName}`,
          label: 'GitHub',
          position: 'right',
        },
        {
          href: `https://npmjs.com/package/@${organizationName}/${projectName}`,
          label: 'npm',
          position: 'right',
        },
      ],
    },
    // footer: {
    //   style: 'dark',
    //   copyright: `Copyright © ${new Date().getFullYear()} Zustand Context, Inc. Built with Docusaurus.`,
    // },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'jsx', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Zustand Context',
        applicationCategory: 'DeveloperApplication',
        description: 'Context-aware state management built on top of Zustand',
      }),
    },
  ],
};

export default config;
