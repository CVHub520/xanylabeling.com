import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import productData from './.generated/data/x-anylabeling.json';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      link: {type: 'generated-index', slug: '/get-started'},
      items: ['get_started', 'user_guide', 'cli', 'faq'],
    },
    {
      type: 'category',
      label: 'Models and extensions',
      collapsed: false,
      link: {type: 'generated-index', slug: '/models-and-extensions'},
      items: ['model_zoo', 'custom_model'],
    },
    {
      type: 'category',
      label: 'Workflows',
      collapsed: false,
      link: {type: 'generated-index', slug: '/workflow-guides'},
      // Keep document IDs and ordering aligned with the product manifest.
      items: productData.workflows.map(({document}) => document.replace(/\.md$/, '')),
    },
    {
      type: 'category',
      label: 'Remote services',
      collapsed: true,
      link: {type: 'generated-index', slug: '/remote-services'},
      items: [
        'remote_service/get_started',
        'remote_service/configuration',
        'remote_service/user_guide',
        'remote_service/router',
      ],
    },
  ],
};

export default sidebars;
