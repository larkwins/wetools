<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import CodeEditor from '@/components/ui/CodeEditor.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const useGorm = ref(true);
const useJsonTag = ref(true);
const omitempty = ref(false);
const sqlText = ref(`CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(128) NOT NULL,
  age INT,
  balance DECIMAL(10, 2),
  is_admin TINYINT(1) DEFAULT 0,
  bio TEXT,
  created_at DATETIME NOT NULL,
  updated_at TIMESTAMP NULL
);`);
const error = ref('');

function toPascal(s: string): string {
  return s
    .replace(/[^A-Za-z0-9]+(.)/g, (_, c: string) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase())
    .replace(/^[0-9]/, (m) => '_' + m);
}

/** SQL 类型 → Go 类型映射 */
function sqlTypeToGo(sqlType: string, nullable: boolean): string {
  const t = sqlType.toLowerCase().split('(')[0].trim();
  let go: string;
  if (/^(tinyint)$/.test(t)) {
    // tinyint(1) 通常视为 bool
    go = /\(\s*1\s*\)/.test(sqlType) ? 'bool' : 'int8';
  } else if (/^smallint$/.test(t)) go = 'int16';
  else if (/^mediumint$/.test(t)) go = 'int32';
  else if (/^int(eger)?$/.test(t)) go = 'int32';
  else if (/^bigint$/.test(t)) go = 'int64';
  else if (/^bool(ean)?$/.test(t)) go = 'bool';
  else if (/^(float|real)$/.test(t)) go = 'float32';
  else if (/^(double|double precision)$/.test(t)) go = 'float64';
  else if (/^(decimal|numeric|money)$/.test(t)) go = 'float64';
  else if (/^(char|varchar|text|tinytext|mediumtext|longtext|nvarchar|nchar|character|character varying)$/.test(t)) go = 'string';
  else if (/^(blob|tinyblob|mediumblob|longblob|binary|varbinary|bytea)$/.test(t)) go = '[]byte';
  else if (/^(json|jsonb)$/.test(t)) go = 'json.RawMessage';
  else if (/^(date|datetime|timestamp|timestamptz|time)$/.test(t)) go = 'time.Time';
  else if (/^uuid$/.test(t)) go = 'string';
  else go = 'string';
  if (nullable && go !== 'string' && go !== '[]byte' && go !== 'json.RawMessage') {
    return '*' + go;
  }
  return go;
}

interface Col {
  name: string;
  goField: string;
  goType: string;
  sqlType: string;
  nullable: boolean;
  isPrimary: boolean;
}

interface Table {
  name: string;
  goName: string;
  cols: Col[];
}

function parseSQL(sql: string): Table[] {
  const tables: Table[] = [];
  // 匹配 CREATE TABLE [IF NOT EXISTS] [schema.]`name` ( ... ) [table options]
  // 关键点：
  //  - 只匹配到列体 ")"，不强制要求末尾 ";"（许多用户粘贴的 DDL 不带分号）
  //  - schema.table 形式也支持
  //  - 列体用 \([\s\S]*?\)，结合下方"括号平衡修正"避免列里嵌套 ()（如 DECIMAL(10,2)）误截断
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:[`"]?\w+[`"]?\.)?[`"]?(\w+)[`"]?\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const name = m[1];
    // 从 "(" 之后开始按括号深度扫描，找出与之匹配的 ")"
    let depth = 1;
    let i = re.lastIndex;
    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      i++;
    }
    if (depth !== 0) continue; // 括号不闭合，跳过
    const body = sql.slice(re.lastIndex, i - 1);
    re.lastIndex = i; // 推进游标，避免下次匹配落在列体内
    const cols = parseColumns(body);
    if (cols.length === 0) continue;
    tables.push({ name, goName: toPascal(name).replace(/s$/, ''), cols });
  }
  return tables;
}

function parseColumns(body: string): Col[] {
  // 按顶层逗号切分（忽略括号内的逗号）
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());

  const cols: Col[] = [];
  const primaryKeys = new Set<string>();
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (lower.startsWith('primary key')) {
      const pk = p.match(/\(([^)]+)\)/);
      if (pk) {
        for (const k of pk[1].split(',')) {
          primaryKeys.add(k.trim().replace(/[`"]/g, ''));
        }
      }
      continue;
    }
    if (
      lower.startsWith('key ') ||
      lower.startsWith('index ') ||
      lower.startsWith('unique ') ||
      lower.startsWith('constraint ') ||
      lower.startsWith('foreign key')
    ) {
      continue;
    }
    // 列定义：`name` TYPE(N) [NOT NULL] [DEFAULT ...] [PRIMARY KEY]
    const cm = p.match(/^[`"]?(\w+)[`"]?\s+([A-Za-z]+(?:\s*\([^)]+\))?)(.*)$/);
    if (!cm) continue;
    const name = cm[1];
    const sqlType = cm[2].trim();
    const rest = cm[3] || '';
    const nullable = !/not\s+null/i.test(rest);
    const isPrimary = /primary\s+key/i.test(rest);
    if (isPrimary) primaryKeys.add(name);
    cols.push({
      name,
      goField: toPascal(name),
      goType: sqlTypeToGo(sqlType, nullable && !isPrimary),
      sqlType,
      nullable: nullable && !isPrimary,
      isPrimary,
    });
  }
  // 标记主键
  for (const c of cols) {
    if (primaryKeys.has(c.name)) c.isPrimary = true;
  }
  return cols;
}

function renderTable(t: Table): string {
  const maxField = Math.max(...t.cols.map((c) => c.goField.length));
  const maxType = Math.max(...t.cols.map((c) => c.goType.length));
  const lines = t.cols.map((c) => {
    const tags: string[] = [];
    if (useJsonTag.value) {
      tags.push(`json:"${c.name}${omitempty.value ? ',omitempty' : ''}"`);
    }
    if (useGorm.value) {
      const gormParts: string[] = [`column:${c.name}`];
      if (c.isPrimary) gormParts.push('primaryKey');
      if (!c.nullable) gormParts.push('not null');
      gormParts.push(`type:${c.sqlType}`);
      tags.push(`gorm:"${gormParts.join(';')}"`);
    }
    const tagStr = tags.length ? ` \`${tags.join(' ')}\`` : '';
    return `\t${c.goField.padEnd(maxField)} ${c.goType.padEnd(maxType)}${tagStr}`;
  });
  return `type ${t.goName} struct {\n${lines.join('\n')}\n}`;
}

const goCode = ref('');
watchEffect(() => {
  try {
    const tables = parseSQL(sqlText.value);
    if (tables.length === 0) {
      error.value = '没有解析到 CREATE TABLE 语句';
      goCode.value = '';
      return;
    }
    goCode.value = tables.map(renderTable).join('\n\n');
    error.value = '';
  } catch (e) {
    error.value = (e as Error).message || String(e);
    goCode.value = '';
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="useJsonTag" type="checkbox" class="accent-[hsl(var(--primary))]" />添加 json tag
      </label>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="omitempty" type="checkbox" class="accent-[hsl(var(--primary))]" />json omitempty
      </label>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="useGorm" type="checkbox" class="accent-[hsl(var(--primary))]" />添加 gorm tag
      </label>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">CREATE TABLE 语句</label>
          <CopyButton :text="sqlText" icon-only />
        </div>
        <CodeEditor v-model="sqlText" lang="sql" :rows="20" placeholder="粘贴 CREATE TABLE…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Go Struct</label>
          <CopyButton :text="goCode" icon-only />
        </div>
        <CodeEditor :model-value="goCode" lang="go" :rows="20" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      支持 MySQL 主流类型与 PostgreSQL 常见类型。tinyint(1) 视为 bool；nullable 列默认用指针；DATE/DATETIME 映射 time.Time。
    </p>
  </div>
</template>
