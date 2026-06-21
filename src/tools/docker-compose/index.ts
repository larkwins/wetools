import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'docker-compose',
  category: 'generator',
  icon: 'Container',
  i18n: {
    zh: { title: 'Docker run → Compose', description: '把 docker run 命令转换为 docker-compose.yml 配置。' },
    en: { title: 'Docker Run → Compose', description: 'Convert a docker run command into docker-compose.yml configuration.' },
  },
  keywords: ['docker', 'devops', '容器', '开发', '代码'],
  privacy: 'local',
};
