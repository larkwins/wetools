<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const dockerCmd = ref(`docker run -d \\
  --name nginx \\
  -p 80:80 \\
  -p 443:443 \\
  -v /etc/nginx:/etc/nginx:ro \\
  -e TZ=Asia/Shanghai \\
  --restart always \\
  nginx:alpine`);
const error = ref('');

interface Parsed {
  image: string;
  name?: string;
  ports: string[];
  volumes: string[];
  envs: Record<string, string>;
  network?: string;
  restart?: string;
  cmd?: string;
  detach: boolean;
  hostname?: string;
  workdir?: string;
  user?: string;
  privileged?: boolean;
}

/** 将 docker run 命令解析为结构化对象 */
function parse(cmd: string): Parsed {
  // 1) 行连续符 \ + 空白合并为单行
  const flat = cmd.replace(/\\\s*\n/g, ' ').replace(/\s+/g, ' ').trim();
  // 2) shell-like tokenize（处理引号）
  const tokens: string[] = [];
  let cur = '';
  let quote = '';
  for (let i = 0; i < flat.length; i++) {
    const ch = flat[i];
    if (quote) {
      if (ch === quote) { quote = ''; }
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ' ') {
      if (cur) { tokens.push(cur); cur = ''; }
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);

  // 3) 去掉前缀 "docker", "run"
  let idx = 0;
  if (tokens[idx] === 'docker') idx++;
  if (tokens[idx] === 'run') idx++;

  const out: Parsed = {
    image: '',
    ports: [],
    volumes: [],
    envs: {},
    detach: false,
  };

  while (idx < tokens.length) {
    const t = tokens[idx];
    const next = () => tokens[++idx];

    if (t === '-d' || t === '--detach') { out.detach = true; }
    else if (t === '-p' || t === '--publish') { out.ports.push(next()); }
    else if (t === '-v' || t === '--volume') { out.volumes.push(next()); }
    else if (t === '-e' || t === '--env') {
      const kv = next();
      const eq = kv.indexOf('=');
      if (eq > 0) out.envs[kv.slice(0, eq)] = kv.slice(eq + 1);
      else out.envs[kv] = '';
    }
    else if (t === '--name') { out.name = next(); }
    else if (t === '--network' || t === '--net') { out.network = next(); }
    else if (t === '--restart') { out.restart = next(); }
    else if (t === '--hostname' || t === '-h') { out.hostname = next(); }
    else if (t === '-w' || t === '--workdir') { out.workdir = next(); }
    else if (t === '-u' || t === '--user') { out.user = next(); }
    else if (t === '--privileged') { out.privileged = true; }
    else if (t.startsWith('-')) {
      // 未识别选项：如果带值则跳过值
      // 简单启发：下一个 token 不是选项 && 不是镜像位置，则当作值
      // 这里保守跳过
    }
    else {
      // 第一个非选项 token 视为镜像
      if (!out.image) {
        out.image = t;
      } else {
        out.cmd = tokens.slice(idx).join(' ');
        break;
      }
    }
    idx++;
  }

  if (!out.image) throw new Error('未找到镜像名');
  return out;
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s.split('\n').map((l) => pad + l).join('\n');
}

const compose = computed<string>(() => {
  error.value = '';
  try {
    const p = parse(dockerCmd.value);
    const serviceName = p.name ?? p.image.split('/').pop()!.split(':')[0];
    const lines: string[] = [];
    lines.push("version: '3.8'");
    lines.push('services:');
    lines.push(`  ${serviceName}:`);
    lines.push(`    image: ${p.image}`);
    if (p.name) lines.push(`    container_name: ${p.name}`);
    if (p.hostname) lines.push(`    hostname: ${p.hostname}`);
    if (p.user) lines.push(`    user: "${p.user}"`);
    if (p.workdir) lines.push(`    working_dir: ${p.workdir}`);
    if (p.privileged) lines.push(`    privileged: true`);
    if (p.restart) lines.push(`    restart: ${p.restart}`);
    if (p.network) lines.push(`    network_mode: ${p.network}`);
    if (p.ports.length) {
      lines.push('    ports:');
      for (const port of p.ports) lines.push(`      - "${port}"`);
    }
    if (p.volumes.length) {
      lines.push('    volumes:');
      for (const v of p.volumes) lines.push(`      - ${v}`);
    }
    if (Object.keys(p.envs).length) {
      lines.push('    environment:');
      for (const k of Object.keys(p.envs)) {
        const v = p.envs[k];
        lines.push(`      ${k}: ${v ? JSON.stringify(v) : '""'}`);
      }
    }
    if (p.cmd) lines.push(`    command: ${p.cmd}`);
    return lines.join('\n');
  } catch (e) {
    error.value = (e as Error).message || String(e);
    return '';
  }
});

const examples = [
  { label: 'nginx', v: 'docker run -d --name nginx -p 80:80 -p 443:443 -v /etc/nginx:/etc/nginx:ro --restart always nginx:alpine' },
  { label: 'redis', v: 'docker run -d --name redis -p 6379:6379 -v redis-data:/data --restart always redis:7-alpine redis-server --requirepass mypassword' },
  { label: 'postgres', v: 'docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=mydb -v pgdata:/var/lib/postgresql/data --restart always postgres:16' },
  { label: 'mysql', v: 'docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=mydb -v mysql-data:/var/lib/mysql mysql:8' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-1.5">
      <span class="text-xs text-muted-foreground">示例：</span>
      <button v-for="e in examples" :key="e.label" type="button"
        class="rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
        @click="dockerCmd = e.v"
      >{{ e.label }}</button>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">docker run 命令</label>
        <Textarea v-model="dockerCmd" mono :rows="14" placeholder="粘贴 docker run 命令…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">docker-compose.yml</label>
          <CopyButton :text="compose" icon-only />
        </div>
        <Textarea :model-value="compose" mono :rows="14" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      支持识别 -d / -p / -v / -e / --name / --network / --restart / --hostname / -w / -u / --privileged 等常见参数。未识别参数会被跳过。
    </p>
  </div>
</template>
