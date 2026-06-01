<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

interface Cmd {
  cmd: string;
  desc: string;
}

interface Group {
  id: string;
  title: string;
  cmds: Cmd[];
}

const GROUPS: Group[] = [
  {
    id: 'init',
    title: '初始化 & 克隆',
    cmds: [
      { cmd: 'git init', desc: '在当前目录初始化空仓库' },
      { cmd: 'git clone <url>', desc: '克隆远程仓库' },
      { cmd: 'git clone --depth 1 <url>', desc: '浅克隆（只取最近一次提交）' },
      { cmd: 'git clone -b <branch> <url>', desc: '克隆指定分支' },
    ],
  },
  {
    id: 'status',
    title: '查看状态 & 历史',
    cmds: [
      { cmd: 'git status', desc: '查看工作区状态' },
      { cmd: 'git status -s', desc: '简短输出（推荐日常使用）' },
      { cmd: 'git log', desc: '查看提交历史' },
      { cmd: 'git log --oneline --graph --all', desc: '图形化所有分支历史（最常用）' },
      { cmd: 'git log -p <file>', desc: '查看某文件的详细修改历史' },
      { cmd: 'git log --since="2 weeks ago"', desc: '查看最近 2 周的提交' },
      { cmd: 'git show <commit>', desc: '查看某次提交的详情' },
      { cmd: 'git blame <file>', desc: '查看文件每行最后修改人' },
      { cmd: 'git reflog', desc: '查看本地引用日志（救命用）' },
    ],
  },
  {
    id: 'add-commit',
    title: '暂存 & 提交',
    cmds: [
      { cmd: 'git add <file>', desc: '暂存指定文件' },
      { cmd: 'git add .', desc: '暂存当前目录所有改动' },
      { cmd: 'git add -p', desc: '交互式暂存（按 hunk 选）' },
      { cmd: 'git commit -m "msg"', desc: '提交' },
      { cmd: 'git commit --amend', desc: '修改上一次提交（commit hash 会变）' },
      { cmd: 'git commit --amend --no-edit', desc: '修改上一次提交但保留原 message' },
      { cmd: 'git restore --staged <file>', desc: '取消暂存（保留改动）' },
      { cmd: 'git restore <file>', desc: '丢弃工作区修改（不可恢复）' },
    ],
  },
  {
    id: 'branch',
    title: '分支',
    cmds: [
      { cmd: 'git branch', desc: '列出本地分支' },
      { cmd: 'git branch -a', desc: '列出所有分支（含远程）' },
      { cmd: 'git branch <name>', desc: '创建分支' },
      { cmd: 'git switch <branch>', desc: '切换分支（推荐，替代 checkout）' },
      { cmd: 'git switch -c <branch>', desc: '创建并切换分支' },
      { cmd: 'git branch -d <branch>', desc: '删除分支（已合并才允许）' },
      { cmd: 'git branch -D <branch>', desc: '强制删除分支' },
      { cmd: 'git branch -m <new>', desc: '重命名当前分支' },
      { cmd: 'git merge <branch>', desc: '合并分支到当前分支' },
      { cmd: 'git merge --squash <branch>', desc: '把分支所有改动压成单次提交' },
    ],
  },
  {
    id: 'remote',
    title: '远程仓库',
    cmds: [
      { cmd: 'git remote -v', desc: '查看远程仓库地址' },
      { cmd: 'git remote add origin <url>', desc: '添加远程仓库' },
      { cmd: 'git remote set-url origin <url>', desc: '修改远程仓库地址' },
      { cmd: 'git fetch', desc: '拉取远程更新（不合并）' },
      { cmd: 'git pull', desc: '拉取并合并' },
      { cmd: 'git pull --rebase', desc: '拉取并变基（避免不必要的 merge commit）' },
      { cmd: 'git push', desc: '推送当前分支' },
      { cmd: 'git push -u origin <branch>', desc: '首次推送并设置上游' },
      { cmd: 'git push --tags', desc: '推送所有标签' },
      { cmd: 'git push origin --delete <branch>', desc: '删除远程分支' },
    ],
  },
  {
    id: 'rebase',
    title: '变基 & 樱桃挑选',
    cmds: [
      { cmd: 'git rebase <branch>', desc: '把当前分支变基到目标分支顶端' },
      { cmd: 'git rebase -i HEAD~3', desc: '交互式整理最近 3 次提交' },
      { cmd: 'git rebase --continue', desc: '解决冲突后继续 rebase' },
      { cmd: 'git rebase --abort', desc: '取消 rebase 回到原状态' },
      { cmd: 'git cherry-pick <commit>', desc: '把某次提交摘到当前分支' },
      { cmd: 'git cherry-pick <a>..<b>', desc: '摘一段提交范围' },
    ],
  },
  {
    id: 'undo',
    title: '撤销 & 救命',
    cmds: [
      { cmd: 'git reset --soft HEAD~1', desc: '撤销上次 commit，保留暂存与改动' },
      { cmd: 'git reset --mixed HEAD~1', desc: '撤销上次 commit，保留改动（默认）' },
      { cmd: 'git reset --hard HEAD~1', desc: '⚠️ 撤销上次 commit 并丢弃改动' },
      { cmd: 'git revert <commit>', desc: '产生一个反向提交以撤销（不改历史）' },
      { cmd: 'git clean -fd', desc: '⚠️ 删除未跟踪文件与目录' },
      { cmd: 'git stash', desc: '把当前改动临时收起' },
      { cmd: 'git stash pop', desc: '恢复最近一次 stash' },
      { cmd: 'git stash list', desc: '列出所有 stash' },
      { cmd: 'git stash drop', desc: '删除最近一次 stash' },
    ],
  },
  {
    id: 'tag',
    title: '标签',
    cmds: [
      { cmd: 'git tag', desc: '列出所有标签' },
      { cmd: 'git tag <name>', desc: '在当前 commit 打轻量标签' },
      { cmd: 'git tag -a v1.0.0 -m "release"', desc: '打附注标签（推荐）' },
      { cmd: 'git tag -d <name>', desc: '删除本地标签' },
      { cmd: 'git push origin <tag>', desc: '推送指定标签' },
      { cmd: 'git push origin --delete <tag>', desc: '删除远程标签' },
    ],
  },
  {
    id: 'config',
    title: '配置 & 别名',
    cmds: [
      { cmd: 'git config --global user.name "Your Name"', desc: '设置用户名' },
      { cmd: 'git config --global user.email "you@example.com"', desc: '设置邮箱' },
      { cmd: 'git config --global init.defaultBranch main', desc: '设置新仓库默认分支为 main' },
      { cmd: 'git config --global core.editor "code --wait"', desc: '设置默认编辑器为 VS Code' },
      { cmd: 'git config --global alias.st status', desc: '别名：git st = git status' },
      { cmd: 'git config --global alias.lg "log --oneline --graph --all"', desc: '别名：git lg = 图形化历史' },
    ],
  },
];

const keyword = ref('');

const filteredGroups = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return GROUPS;
  return GROUPS
    .map((g) => ({
      ...g,
      cmds: g.cmds.filter((c) => c.cmd.toLowerCase().includes(kw) || c.desc.toLowerCase().includes(kw)),
    }))
    .filter((g) => g.cmds.length > 0);
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="relative">
      <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" placeholder="搜索命令或说明…" class="pl-9" />
    </div>

    <div v-if="filteredGroups.length === 0" class="rounded-md border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
      没有匹配的命令
    </div>

    <section v-for="g in filteredGroups" :key="g.id" class="flex flex-col gap-2">
      <h3 class="text-sm font-semibold text-foreground">{{ g.title }}</h3>
      <div class="grid gap-1.5">
        <div v-for="(c, i) in g.cmds" :key="i" class="group flex items-center gap-2 rounded-md border bg-card px-3 py-2 transition-colors hover:border-primary/40">
          <code class="flex-1 font-mono text-xs text-foreground sm:text-sm">{{ c.cmd }}</code>
          <span class="hidden flex-1 text-xs text-muted-foreground sm:block">{{ c.desc }}</span>
          <CopyButton :text="c.cmd" icon-only />
        </div>
        <!-- 移动端：描述独立成行 -->
        <div v-if="false" />
      </div>
    </section>
  </div>
</template>
