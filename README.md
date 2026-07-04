# 摸鱼工厂 — 抖音 Idle 小游戏 Starter

竖屏挂机增量小游戏 MVP，基于 **Cocos Creator 3.8 + TypeScript**，目标平台 **抖音小游戏**。

## 项目结构

```
douyin-idle-factory/
├── assets/
│   └── scripts/
│       ├── config/          # 升级配置、常量
│       ├── core/            # GameManager、资源、存档、生产
│       ├── platform/        # 抖音 tt API 封装
│       └── ui/              # HUD、升级面板、按钮
├── docs/
│   ├── GDD.md               # 一页游戏设计文档
│   ├── EDITOR_SETUP.md      # Cocos 编辑器接线指南
│   └── CURSOR_AGENT_PROMPTS.md  # Cursor Agent + Skill 提问模板
├── settings/                # Cocos 项目设置
├── package.json
├── tsconfig.json
└── README.md
```

## 前置要求

| 工具 | 版本 | 用途 |
|------|------|------|
| [Cocos Creator](https://www.cocos.com/creator-download) | **3.8.x** | 游戏引擎 |
| [抖音开发者工具](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/dev-tools/developer-instrument-update-and-download) | 2.x | 预览、上传 |
| 抖音开放平台账号 | — | AppID、审核、流量主 |

## 快速开始

### 1. 用 Cocos Creator 打开项目

1. 启动 Cocos Creator 3.8
2. **打开其他项目** → 选择本目录 `/Users/a1/Projects/douyin-idle-factory`
3. 等待脚本编译完成（首次打开会生成 `library/`、`temp/`）

### 2. 在编辑器中搭建场景

代码已就绪，场景需在编辑器中创建。详见 [docs/EDITOR_SETUP.md](docs/EDITOR_SETUP.md)。

简要步骤：

1. 新建场景 `assets/scenes/Main.scene`（720×1280 竖屏）
2. 创建空节点 `GameRoot`，挂载 `GameManager`
3. 创建 UI：金币 Label、自动产出 Label、摸鱼 Button、看广告 Button
4. 创建 UpgradePanel + ScrollView + UpgradeRow Prefab
5. 保存场景并设为启动场景

### 3. 本地预览

- Cocos 编辑器点击 **播放** — 使用 `localStorage` 模拟存档，广告模拟 500ms 后成功
- 浏览器预览即可验证核心循环

### 4. 注册抖音小游戏

1. 登录 [抖音开放平台](https://developer.open-douyin.com/)
2. **创建小游戏** → 获取 **AppID**
3. 下载并安装 **抖音开发者工具**
4. 在 `assets/scripts/config/GameConstants.ts` 中填入 `REWARDED_AD_UNIT_ID`（需先开通流量主并创建广告位）

### 5. 构建发布到抖音

1. Cocos：**项目 → 构建发布**
2. 发布平台选择 **抖音小游戏**
3. 填入 AppID，设备方向 **Portrait（竖屏）**
4. 启用 **MD5 Cache**；若包体 > 4MB，配置远程资源地址
5. 点击 **构建** → 生成 `build/bytedance-mini-game/`
6. 用抖音开发者工具打开该目录
7. 真机扫码预览 → **上传** → 后台提审

官方文档：[发布到抖音小游戏 (Cocos 3.8)](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-bytedance-mini-game.html)

## 核心玩法（MVP）

- **点击** 产出摸鱼值
- **5 种升级**：手速、自动工位、离线仓库、离线倍率、全厂加成
- **离线收益**：最多积累（基础 2h + 升级扩展）
- **激励视频**：观看后 5 分钟双倍产出
- **存档**：`tt.setStorageSync` / 编辑器 `localStorage`

升级价格公式：`baseCost × 1.15^level`

## 4 周开发清单

### 第 1 周：核心循环

- [x] 项目脚手架 + 核心脚本
- [ ] Cocos 场景搭建（Main.scene）
- [ ] 点击产出 + 自动产出 tick 验证
- [ ] 5 个升级可购买
- **验收**：连续玩 15 分钟不卡死

### 第 2 周：持久化 + Meta

- [x] SaveManager + 离线收益计算
- [ ] 离线收益弹窗 UI
- [ ] 升级列表 ScrollView 完善
- [ ] 主包资源压缩 < 4MB
- **验收**：关闭重开进度保留

### 第 3 周：抖音平台化

- [ ] 填入真实 AppID 构建
- [ ] 接入 `tt.createRewardedVideoAd`（替换占位 adUnitId）
- [ ] 接入必接能力（侧边栏复访等，按平台最新文档）
- [ ] 音效（3–5 个免费音效即可）
- **验收**：抖音真机扫码可玩 + 广告可展示

### 第 4 周：测试 + 上线

- [ ] 5–10 人试玩，记录第 5 分钟流失点
- [ ] 数值调优（`game-balance-debugging`：加倍减半原则）
- [ ] 上传测试版 → 提审
- [ ] 准备 1 条短视频素材用于冷启动

## 配置项

| 文件 | 说明 |
|------|------|
| `assets/scripts/config/GameConstants.ts` | 广告位 ID、boost 时长 |
| `assets/scripts/config/UpgradeConfig.ts` | 5 个升级定义与价格公式 |

## 相关 Skills（~/.cursor/skills/）

开发时在 Cursor Agent 中结合 **Harness**（读项目→改代码→验证）与 Skill 使用。提问模板见 [docs/CURSOR_AGENT_PROMPTS.md](docs/CURSOR_AGENT_PROMPTS.md)。

| 阶段 | Skill |
|------|-------|
| **引擎规范（建议每次带上）** | `cocos-creator-38-douyin` |
| 数值调优 | `game-balance-debugging` |
| 奖励/广告节奏 | `reward-system-design` |
| 新手引导 | `player-learning-error-handling` |
| 试玩诊断 | `game-testing-and-ux-diagnosis` |
| 不确定用哪个 | `game-design-skills-index` |

## 注意事项

- **主包 4MB 限制**：大图放 CDN，启用分包
- **竖屏优先**：激励广告为竖屏全屏
- **Editor 与真机**：`tt` API 仅在抖音环境可用，编辑器内自动降级
- **不要提交** `library/`、`temp/`、`build/`（已在 .gitignore）

## License

Starter template — use freely for your Douyin mini game project.
