import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'math-eval',
  category: 'cheatsheet',
  icon: 'Calculator',
  i18n: {
    zh: { title: '数学表达式求值', description: '支持函数、变量、单位、矩阵的表达式计算（基于 mathjs）。' },
    en: { title: 'Math Evaluator', description: 'Expression evaluator with functions, variables, units & matrices (mathjs).' },
  },
  keywords: ['数学', '表达式', '计算器', '数字'],
  privacy: 'local',
};
