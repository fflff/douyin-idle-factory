# Cursor Agent 提问指南

在 Cursor Agent 中结合 **Harness**（读项目→改代码→验证）与 **Skill**（游戏设计方法论 + Cocos 3.8 引擎规范）开发本项目。

## 工作流

每次提问建议带上三步要求，Agent 会直接改代码而非只给建议：

1. **【读项目】** — 读 `docs/GDD.md`、相关 `assets/scripts/` 文件
2. **【改代码】** — 按 Skill 方法论直接 Edit `.ts` 文件
3. **【验证】** — ReadLints / `tsc`，并说明如何在 Cocos Creator 3.8 编辑器验证

## 推荐 Skill 组合

| Skill | 用途 |
|-------|------|
| `cocos-creator-38-douyin` | Cocos 3.8 + 抖音小游戏读/改/验证规范（**每次开发任务建议带上**） |
| `game-design-skills-index` | 不确定用哪个设计 skill 时 |
| `game-balance-debugging` | 数值调优（加倍减半原则） |
| `reward-system-design` | 激励视频奖励节奏 |
| `ux-design-principles` | UI 布局、菲兹定律 |
| `player-learning-error-handling` | 新手引导 |
| `game-testing-and-ux-diagnosis` | 试玩测试方案 |
| `koster-fun-theory-design` | 核心循环趣味性 |
| `game-economy-supply-demand-design` | 升级经济平衡 |
| `game-development-project-management` | 里程碑与优先级 |

Skill 安装位置：`~/.cursor/skills/`（源目录：`~/Desktop/游戏开发skill`）

## 4 周开发清单 × 提问模板

### 第 1 周：核心循环

**评估核心循环趣味性**

```
背景：douyin-idle-factory，Cocos Creator 3.8 + TypeScript，抖音小游戏竖屏。
Skill：cocos-creator-38-douyin + koster-fun-theory-design
任务：评估「点击摸鱼 → 购买升级 → 自动产出」循环是否有趣。

请按以下步骤执行：
1. 【读项目】读 docs/GDD.md、assets/scripts/core/IdleProduction.ts、UpgradeSystem.ts
2. 【改代码】如有改进建议且涉及逻辑，直接改对应 .ts
3. 【验证】ReadLints，说明我在 Cocos 3.8 编辑器播放时该观察什么
```

**数值调优 auto_desk**

```
背景：Cocos Creator 3.8，Idle 增量小游戏。
Skill：cocos-creator-38-douyin + game-balance-debugging
任务：auto_desk 基础价格 50 是否合理。

请按以下步骤执行：
1. 【读项目】读 assets/scripts/config/UpgradeConfig.ts、docs/GDD.md、IdleProduction.ts
2. 【改代码】用加倍减半原则分析，不合理就直接改 baseCost
3. 【验证】ReadLints + 列出改动对前 30 分钟体验的影响，提醒我在编辑器播放测试
```

### 第 2 周：持久化 + Meta

**离线收益弹窗**

```
背景：douyin-idle-factory，Cocos Creator 3.8。
Skill：cocos-creator-38-douyin + player-learning-error-handling
任务：设计离线收益弹窗的 UX，并实现 UI 逻辑。

请按以下步骤执行：
1. 【读项目】读 docs/GDD.md、SaveManager.ts、ui/UIManager.ts、docs/EDITOR_SETUP.md
2. 【改代码】实现弹窗逻辑；场景节点步骤参考 EDITOR_SETUP.md 写在回复里
3. 【验证】ReadLints，说明编辑器里如何触发离线收益测试
```

**升级经济平衡**

```
Skill：cocos-creator-38-douyin + game-economy-supply-demand-design
任务：5 种升级之间的资源消耗是否合理。

请按以下步骤执行：
1. 【读项目】读 UpgradeConfig.ts、UpgradeSystem.ts、GDD.md
2. 【改代码】如需调整价格或效果，直接改配置
3. 【验证】ReadLints + 给出前 20 分钟购买路径分析
```

### 第 3 周：抖音平台化

**激励视频奖励节奏**

```
背景：douyin-idle-factory，Cocos Creator 3.8 + TypeScript，抖音小游戏竖屏。
Skill：cocos-creator-38-douyin + reward-system-design
任务：设计激励视频「5 分钟双倍摸鱼」的奖励节奏。

请按以下步骤执行：
1. 【读项目】读 docs/GDD.md、GameConstants.ts、DouyinPlatform.ts、GameManager.ts
2. 【改代码】如需调整，直接改 GameConstants.ts 或 DouyinPlatform.ts
3. 【验证】ReadLints，说明编辑器模拟 vs 抖音真机验证步骤
```

**接入真实广告位**

```
Skill：cocos-creator-38-douyin
任务：检查 DouyinPlatform.ts 激励视频接入是否完整，补齐缺失逻辑。

请按以下步骤执行：
1. 【读项目】读 DouyinPlatform.ts、GameConstants.ts、GameManager.ts
2. 【改代码】完善 tt.createRewardedVideoAd 接入，保留编辑器降级
3. 【验证】ReadLints + 列出抖音开发者工具真机测试清单
```

### 第 4 周：测试 + 上线

**试玩测试方案**

```
Skill：cocos-creator-38-douyin + game-testing-and-ux-diagnosis
任务：设计 5–10 人试玩方案，重点关注第 5 分钟流失点。

请按以下步骤执行：
1. 【读项目】读 docs/GDD.md、README.md 4 周清单
2. 【改代码】如试玩暴露问题需改数值，直接改 UpgradeConfig.ts
3. 【验证】输出试玩记录表模板 + 编辑器验证步骤
```

**里程碑排期**

```
Skill：cocos-creator-38-douyin + game-development-project-management
任务：第 3 周抖音平台化任务怎么排优先级。

请按以下步骤执行：
1. 【读项目】读 README.md、GDD.md、当前代码完成度
2. 【改代码】如无代码改动，跳过并说明
3. 【验证】输出优先级列表与每项验收标准
```

## 验证 Skill 是否生效

新开 Agent 对话，发送：

```
列出你当前可用的游戏设计相关 skill，并说明 game-balance-debugging 的核心原则。
```

若 Agent 能引用「加倍减半原则」具体内容，说明 Harness + Skill 已正常工作。

再测试 Cocos skill：

```
用 cocos-creator-38-douyin，说明本项目改数值时应读哪些文件、改哪些文件。
```

## 维护 Skill

Desktop 源目录更新后同步到 Cursor：

```bash
rsync -av \
  "/Users/a1/Desktop/游戏开发skill/" \
  ~/.cursor/skills/ \
  --exclude='.claude' \
  --exclude='index.md'
```

同步后新开 Agent 对话。`game-design-skills-index` 与 `cocos-creator-38-douyin` 仅在 `~/.cursor/skills/` 维护，不在 Desktop 源目录。
