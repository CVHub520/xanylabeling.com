import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      items: ['get_started', 'user_guide', 'cli', 'faq'],
    },
    {
      type: 'category',
      label: 'Models and extensions',
      collapsed: false,
      items: ['model_zoo', 'custom_model'],
    },
    {
      type: 'category',
      label: 'Workflows',
      collapsed: false,
      items: [
        'image_classifier',
        'paddle_ocr',
        'video_classifier',
        'vqa',
        'chatbot',
      ],
    },
    {
      type: 'category',
      label: 'Remote services',
      collapsed: true,
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
