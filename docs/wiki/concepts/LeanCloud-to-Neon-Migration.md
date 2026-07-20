---
title: LeanCloud 迁移至 Neon PostgreSQL（Waline 评论数据）
description: "LeanCloud 2027 年停止对外服务后，Waline 评论数据从 LeanCloud 导出 → 格式转换 → 导入 Neon PostgreSQL 的完整迁移流程（Vercel 集成）"
created: 2026-07-01
updated: 2026-07-01
type: concept
tags: [DevOps, Deploy, Migrate, Waline, LeanCloud, Neon, PostgreSQL, Vercel]
sources:
  - docs/postMortem/deploy/005_leancloud_migrate_neon_relate.md
related:
  - docs/wiki/sources/PostMortem.md
---

# LeanCloud 迁移至 Neon PostgreSQL（Waline 评论数据）

## 背景

LeanCloud 于 `2026 年 1 月 12 日` 发布公告，宣布将于 `2027 年 1 月 12 日` 正式停止对外服务。
本站 Waline 评论系统原本使用 LeanCloud 作为数据存储后端，因此必须在此之前完成数据迁移。

**目标**：将 Waline 评论数据从 LeanCloud 迁移到 Vercel 集成的 Neon PostgreSQL。

## 完整迁移流程（4 步，顺序不可颠倒）

### 1. 从 LeanCloud 导出 Waline 数据

1. 登录 LeanCloud 控制台，进入用于存储评论的应用
2. 左侧菜单 → **数据存储 → 导入导出** → **数据导出** 选项卡
3. 点击 **导出**，等待 `.tar.gz` 压缩包生成

**导出范围建议**（数据量大时）：

- `Comment` — 评论主表
- `Counter` — 访问计数
- `Users` — 评论用户

::: warning
必须三个表都导出；只导出会导致后续 `waline.json` 缺少表结构。
:::

导出的 `.tar.gz` 解压后包含 JSONL 格式的原始数据，例如 `Comment.0.jsonl`。

### 2. 在 Vercel 中创建 Neon 数据库并链接

1. 进入用于博客部署的 Vercel 应用
2. 左侧菜单 → **Storage** → 右侧 **Create Database**
3. Provider 选择 **Neon**，使用 GitHub 账号关联创建
4. 创建时可保持默认（修改 region 为「新加坡」可降低延迟，但理论上不影响功能）
5. 创建后点击 **Open in Neon** 跳转

**创建表结构**：

1. 在 Neon 界面左侧选择 **SQL Editor**
2. 粘贴 `waline.pgsql`（来自 [waline 官方仓库](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql)）的 SQL
3. 点击 **Run** 执行建表

### 3. 数据格式转换 + 上传

需要三件东西：**转换脚本**、**ini 配置文件**、**转换后的 JSON**。

#### 3.1 创建 `waline-neon.ini`

```ini
[neon]
host=ep-xxxx-dew-xxxx-pooler.c-4.us-east-1.aws.neon.tech
port=5432
user=neondb_owner
password=<PASSWORD>
database=neondb
sslmode=require
```

- `host` 和 `password` 在 Vercel → Storage → Neon → Quickstart 的 `.env.local` 中查找：
  - `host` ← `PGHOST`
  - `password` ← `PGPASSWORD`
  - `user`、`database` 默认即可

#### 3.2 用 Python 将 LeanCloud JSONL 转换为 waline.json

```python
import json
import os
import re

def parse_leancloud_jsonl(filepath):
    """读取 LeanCloud 导出的 JSONL，返回对象列表"""
    items = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # 跳过 LeanCloud 注释头
            if line.startswith('#'):
                continue
            obj = json.loads(line)

            # 处理 LeanCloud Date 对象格式
            for key in ['insertedAt', 'createdAt', 'updatedAt']:
                if key in obj and isinstance(obj[key], dict) and obj[key].get('__type') == 'Date':
                    obj[key] = obj[key]['iso']

            # 删除不需要的字段
            for key in ['ACL', '__type']:
                obj.pop(key, None)

            items.append(obj)
    return items

def main():
    files = {
        'Comment': 'Comment.0.jsonl',
        'Counter': 'Counter.0.jsonl',
        'Users': 'Users.0.jsonl',
    }

    data = {}
    for table, filename in files.items():
        if os.path.exists(filename):
            print(f"正在处理 {filename} ...")
            data[table] = parse_leancloud_jsonl(filename)
        else:
            print(f"警告：未找到 {filename}，将使用空数组")
            data[table] = []

    output = {
        "__version": "1.0.0",
        "type": "waline",
        "version": 1,
        "time": 0,
        "tables": ["Comment", "Counter", "Users"],
        "data": data
    }

    with open('waline.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("转换完成！已生成 waline.json")

if __name__ == '__main__':
    main()
```

**关键点**：将 LeanCloud 的 `{"__type":"Date","iso":"..."}` 格式转换为标准 ISO 字符串；删除 `ACL` / `__type` 等 LeanCloud 私有字段。

#### 3.3 上传到 Neon

下载 [waline-data-import-tool](https://github.com/elkan1788/waline-data-import-tool) 的 release 可执行文件（Windows 用 `.exe`；Linux/macOS 对应 release）。

将以下三个文件放在同一目录下：

- `waline-data-import-tool.exe`（或对应平台二进制）
- `waline-neon.ini`
- `waline.json`

以**管理员身份**打开 PowerShell，执行：

```powershell
.\waline-data-import-tool.exe -f .\waline.json -c .\waline-neon.ini
```

数据会逐步上传到 Neon。

### 4. 重新部署 Vercel

上传完成后，在 Vercel 中点击 **Redeploy**，让新的环境变量配置生效。

## 关键陷阱

- **顺序不可颠倒**：必须先导出 → 建表 → 转换 → 上传 → 重新部署。跳过 `waline.pgsql` 建表步骤会导致导入失败。
- **配置文件位置**：`host` 是 Neon 给的 `-pooler` 域名，不是 `ep-xxx.aws.neon.tech` 直连域名（pooler 用于 serverless 冷启动）。
- **LeanCloud Date 字段**：JSONL 中 `insertedAt` / `createdAt` / `updatedAt` 是嵌套 dict，转换脚本必须递归处理，否则 Postgres 报类型错误。
- **管理员权限**：Windows 下 waline-data-import-tool 需要管理员 PowerShell（写入网络配置/SSL 证书）。

## 验证清单

迁移完成后，访问博客评论区发一条测试评论，验证：

- 评论写入 Neon 数据库（Neon SQL Editor 中能查到）
- 已有评论从 LeanCloud 完整导入（用户名、时间、内容无丢失）
- 评论计数（Counter）功能正常
