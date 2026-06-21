import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'mic-test',
  category: 'detect',
  icon: 'Mic',
  i18n: {
    zh: { title: '麦克风检测', description: '实时显示音量波形与分贝，可录音回放测试输入设备。' },
    en: { title: 'Microphone Test', description: 'Live volume waveform & dB meter, record & replay to test mic input.' },
  },
  keywords: ['麦克风', '音频', '设备', '录音'],
  privacy: 'local',
};
