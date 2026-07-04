# Cocos Creator 编辑器接线指南

本 starter 只包含 TypeScript 脚本。按以下步骤在 Cocos Creator 3.8 中创建场景和 UI。

## 1. 创建主场景

1. 在 `assets/scenes/` 右键 → **新建 → Scene**
2. 命名为 `Main`
3. **项目设置 → 项目数据** 中将 `Main` 设为启动场景

## 2. 节点树结构（推荐）

```
Main (Canvas 720×1280, Fit Width)
├── GameRoot          [GameManager]
├── UI
│   ├── TopBar
│   │   ├── TitleLabel      (Label: "摸鱼工厂")
│   │   ├── CoinsLabel      (Label: "0")
│   │   ├── AutoRateLabel   (Label: "+0/秒")
│   │   └── BoostLabel      (Label, 默认隐藏)
│   ├── TapArea
│   │   └── TapButton       (Button + TapButton 组件)
│   ├── AdArea
│   │   └── AdBoostButton   (Button + AdBoostButton 组件)
│   └── UpgradeArea
│       └── UpgradePanel    [UpgradePanel]
│           └── ScrollView
│               └── view → content (contentNode)
```

## 3. 挂载组件

### GameRoot

- 添加组件 → 自定义脚本 → **GameManager**
- 此节点会被设为持久化根节点

### UI 根节点

- 添加 **UIManager**
- 拖拽绑定：
  - `coinsLabel` → CoinsLabel
  - `autoRateLabel` → AutoRateLabel
  - `boostLabel` → BoostLabel
  - `titleLabel` → TitleLabel

### TapButton

- 在 TapArea 的 Button 节点上添加 **TapButton**
- Button 的 Click Events → 拖入自身 → 选 `TapButton.onTap`

### AdBoostButton

- 在广告 Button 上添加 **AdBoostButton**
- Click Events → `AdBoostButton.onWatchAd`

## 4. 创建 UpgradeRow Prefab

1. 新建空节点 `UpgradeRow`，添加 **UpgradeRow** 组件
2. 子节点结构：

```
UpgradeRow [UpgradeRow]
├── NameLabel    (Label, 宽 200)
├── DescLabel    (Label, 字号小)
├── LevelLabel   (Label, 右对齐)
├── CostLabel    (Label)
└── BuyButton    (Button "购买")
```

3. 在 UpgradeRow 组件上绑定各 Label 和 BuyButton
4. 拖入 `assets/prefabs/UpgradeRow.prefab` 保存为 Prefab
5. 删除场景中的实例

### UpgradePanel 绑定

- `upgradeRowPrefab` → UpgradeRow.prefab
- `contentNode` → ScrollView/content 节点

## 5. 样式建议（占位美术）

| 元素 | 建议 |
|------|------|
| 背景 | 纯色 #2d3436 或简单渐变 |
| 摸鱼按钮 | 大圆角矩形，#00b894，文字「摸鱼」 |
| 金币 | 大号字体 48px，黄色 #fdcb6e |
| 升级行 | 高 80px，深色底 #636e72 |

正式美术可后续替换，MVP 用 Cocos 内置 UI 即可。

## 6. 预览验证清单

- [ ] 点击摸鱼按钮，金币增加
- [ ] 购买手速训练后，每次点击产出增加
- [ ] 购买自动工位后，每秒自动增加
- [ ] 刷新页面（浏览器）后进度保留
- [ ] 点击看广告，控制台显示模拟成功，Boost 倒计时出现

## 7. 构建前检查

- [ ] `GameConstants.ts` 中 `REWARDED_AD_UNIT_ID` 已替换
- [ ] 构建平台：抖音小游戏，竖屏 Portrait
- [ ] AppID 已填写
- [ ] 主包大小 < 4MB（构建面板可查看）

## 8. 脚本文件说明（每个文件只能有一个 Component）

| 脚本 | 挂载位置 |
|------|----------|
| `GameManager.ts` | GameRoot |
| `UIManager.ts` | UI 根节点 |
| `TapButton.ts` | 摸鱼 Button |
| `AdBoostButton.ts` | 看广告 Button |
| `UpgradePanel.ts` | UpgradeArea |
| `UpgradeRow.ts` | UpgradeRow Prefab 根节点 |

## 9. 常见问题

**Q: 脚本报错 `Each script can have at most one Component`**  
A: Cocos 规定 **一个 .ts 文件只能有一个 `@ccclass` 组件**。若仍报错，菜单 **开发者 → 重新编译脚本**，或关闭项目后删除 `temp/` 再打开。

**Q: 场景一片粉红 / `Bad CPU type in executable`**  
A: 你的 Mac 是 **Apple Silicon (M 系列)**，但 Cocos 3.8.0 内置工具是 **Intel 版**。任选其一：
1. **推荐**：Dashboard 改装 **Cocos Creator 3.8.8**（Apple 芯片原生版）
2. 或：访达 → 应用程序 → 右键 Cocos Creator → **显示简介** → 勾选 **使用 Rosetta 打开**，重启编辑器

**Q: 脚本编译报错找不到 `cc` 模块**  
A: 必须在 Cocos Creator 内打开项目，编辑器会生成 `temp/declarations/`。

**Q: GameManager.instance 为 null**  
A: 确保 GameRoot 在场景加载时就存在，且 UIManager/UpgradePanel 在 start 阶段才访问。

**Q: 抖音真机广告不显示**  
A: 确认已开通流量主、广告位 ID 正确、在真机而非开发者工具模拟。
