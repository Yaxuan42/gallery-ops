# 对话示例

## 1. 已知 SPU，快速录入 SKU

```
用户：帮我录一个 PJ-SI-59-A，1965年的，Teak 加 Cane

Agent：
📦 JD-001 | Low Caned Armless Easy Chair（袋鼠椅）
   SPU: PJ-SI-59-A

基本：Pierre Jeanneret / Chandigarh, India
年代：设计 1965 / 生产 1965
规格：Teak, Cane / 品相 —
价格：定价 — / 买手价 — / 参考 —
状态：在库

⚡ 推断：名称、俗称、设计师、产地（基于 SPU PJ-SI-59-A）

你说品相还不错，算 A 还是 B？

用户：A

Agent：好，品相 A。已录入 ✓
```

## 2. SPU 不存在，先建再录

```
用户：新到了一个 Wegner 的 Wishbone Chair，CH24

Agent：CH24 这个产品类型我还没有记录。帮你创建：

📋 新 SPU: CH24

名称：Wishbone Chair
品类：Danish Modern
设计师：Hans Wegner
产地：—
设计年代：—
材质：—

描述/故事/背景：—（待补充）

这些信息对吗？材质和年代知道吗？

用户：1949年设计的，橡木和纸绳，丹麦产

Agent：好，更新 SPU：

  设计年代：1949
  材质：Oak, Paper Cord
  产地：Denmark

SPU 创建完成，现在录入这件藏品：

📦 JD-012 | Wishbone Chair
   SPU: CH24

基本：Hans Wegner / Denmark
年代：设计 1949 / 生产 —
规格：Oak, Paper Cord / 品相 —
状态：在库

确认？

用户：确认

Agent：已录入 ✓ SPU CH24 + SKU JD-012
```

## 3. 一句话记录销售（自动联动）

```
用户：袋鼠椅卖给张先生了，15万，他是从小红书来的

Agent：
🧾 SO-20260328-001

客户：张先生（新建 C-001，个人，来源：小红书）
藏品：JD-001 Low Caned Armless Easy Chair（袋鼠椅）
成交价：¥150,000
毛利：—（无买手价记录）

将同时：
  • JD-001 状态：在库 → 已售
  • 新建客户 C-001

确认？

用户：确认，买手价 8 万

Agent：更新买手价 ¥80,000。
毛利：¥70,000（46.7%）

全部写入完成 ✓
  • 销售单 SO-20260328-001
  • 客户 C-001（张先生）
  • JD-001 状态 → 已售，买手价 → ¥80,000
```

## 4. 批量采购录入

```
用户：从印度政府仓库进了 3 件，两把办公椅 28-A 和一个文件架 27-A，
     总共 2 万美金，已付清

Agent：
📥 PO-20260328-001

供应商：印度政府仓库（新建 SUP-001）
总成本：$20,000（货款 $20,000）/ 已付
汇率：—

藏品：
  • JD-002 Office Cane Chair（PJ-SI-28-A）
  • JD-003 Office Cane Chair（PJ-SI-28-A）
  • JD-004 File Rack（PJ-R-27-A）

将同时：
  • 创建 3 件新藏品（状态：在途）
  • 新建供应商 SUP-001

确认？

用户：确认，汇率 7.2

Agent：汇率 7.2，折合人民币约 ¥144,000，单件均摊约 ¥48,000。
全部写入完成 ✓
```

## 5. 更新 SPU 内容（面向藏家描述）

```
用户：帮我写一下袋鼠椅的介绍，它因为侧面像袋鼠得名，
     是 Jeanneret 在 Chandigarh 设计的休闲椅

Agent：我帮你写了 PJ-SI-59-A 的描述，你看合适吗？

📋 SPU PJ-SI-59-A 内容更新

description:
  "Jeanneret 为昌迪加尔项目设计的标志性休闲椅，低矮宽敞的坐姿
   邀请使用者放松身心。柚木框架搭配手工藤编，兼具结构力量与透气轻盈。"

design_story:
  "因侧面轮廓酷似袋鼠的蹲坐姿态而得名'袋鼠椅'。无扶手的设计让坐者
   可以自由调整坐姿，向后倾斜的靠背形成一种独特的半躺半坐状态。"

确认写入？还是你有自己的版本？

用户：可以，historical_context 也补一下

Agent：
historical_context:
  "1950年代，Pierre Jeanneret 作为昌迪加尔城市项目的首席建筑师，
   为这座柯布西耶规划的新城设计了全套公共家具。这把休闲椅最初被放置
   在政府官员住宅中，是 Jeanneret 少数几件面向生活场景而非办公场景
   设计的作品。"

确认？

用户：确认

Agent：PJ-SI-59-A 三个内容字段已更新 ✓
```

## 6. 查询

```
用户：现在库里有什么？

Agent：当前库存 4 件：

| 编号 | 名称 | SPU | 状态 |
|---|---|---|---|
| JD-002 | Office Cane Chair | PJ-SI-28-A | 在途 |
| JD-003 | Office Cane Chair | PJ-SI-28-A | 在途 |
| JD-004 | File Rack | PJ-R-27-A | 在途 |
| JD-012 | Wishbone Chair | CH24 | 在库 |

已售 1 件（JD-001 袋鼠椅）。
SPU 共 13 种。需要看哪件的详情？
```
