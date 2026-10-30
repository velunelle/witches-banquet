import { randomIndex } from "../core/engine.js";
const tails = [
  "，第一口就把香气送到舌尖了。慢慢嚼还能尝到一点回甜。小叉子先别收，我才刚和它熟起来！",
  "，舌尖轻轻一压，口感就散开来，香味还留在嘴里。哼哼，嘴上说只尝一点，手已经偷偷准备下一勺。",
  "，这一口的甜度刚好，咽下去还想抿抿嘴。好吃得帽子都想晃两下，先别盯着我笑嘛！",
];
const dishes = [
  {
    key: "water-0",
    name: "草莓月牙泡芙",
    image: "assets/watercolor/water-0.webp",
    options: [
      {
        label: "酥皮轻轻碎",
        tail: 0,
      },
      {
        label: "草莓酸酸甜甜",
        tail: 1,
      },
      {
        label: "奶油软得好乖",
        tail: 2,
      },
    ],
  },
  {
    key: "water-1",
    name: "白桃猫爪慕斯",
    image: "assets/watercolor/water-1.webp",
    options: [
      {
        label: "桃香好清甜",
        tail: 0,
      },
      {
        label: "慕斯一抿就化",
        tail: 1,
      },
      {
        label: "饼干底酥酥",
        tail: 2,
      },
    ],
  },
  {
    key: "water-2",
    name: "南瓜奶油卷",
    image: "assets/watercolor/water-2.webp",
    options: [
      {
        label: "南瓜香暖暖",
        tail: 0,
      },
      {
        label: "蛋糕绵绵软软",
        tail: 1,
      },
      {
        label: "奶油卷好轻",
        tail: 2,
      },
    ],
  },
  {
    key: "water-3",
    name: "蓝莓星星挞",
    image: "assets/watercolor/water-3.webp",
    options: [
      {
        label: "蓝莓咬出果汁",
        tail: 0,
      },
      {
        label: "挞壳咔嚓响",
        tail: 1,
      },
      {
        label: "奶酪酸甜刚好",
        tail: 2,
      },
    ],
  },
  {
    key: "water-4",
    name: "桂花奶冻",
    image: "assets/watercolor/water-4.webp",
    options: [
      {
        label: "桂花香慢慢来",
        tail: 0,
      },
      {
        label: "奶冻滑溜溜",
        tail: 1,
      },
      {
        label: "甜味好清爽",
        tail: 2,
      },
    ],
  },
  {
    key: "water-5",
    name: "栗子小山蛋糕",
    image: "assets/watercolor/water-5.webp",
    options: [
      {
        label: "栗蓉绵得很",
        tail: 0,
      },
      {
        label: "蛋糕松松软软",
        tail: 1,
      },
      {
        label: "坚果香好浓",
        tail: 2,
      },
    ],
  },
  {
    key: "water-6",
    name: "葡萄汽水杯",
    image: "assets/watercolor/water-6.webp",
    options: [
      {
        label: "葡萄果味足",
        tail: 0,
      },
      {
        label: "气泡轻轻跳",
        tail: 1,
      },
      {
        label: "冰凉又清爽",
        tail: 2,
      },
    ],
  },
  {
    key: "water-7",
    name: "蜂蜜云朵松饼",
    image: "assets/watercolor/water-7.webp",
    options: [
      {
        label: "松饼蓬蓬的",
        tail: 0,
      },
      {
        label: "蜂蜜香甜甜",
        tail: 1,
      },
      {
        label: "奶油像小云",
        tail: 2,
      },
    ],
  },
  {
    key: "water-8",
    name: "紫薯幽灵布丁",
    image: "assets/watercolor/water-8.webp",
    options: [
      {
        label: "紫薯甜香浓",
        tail: 0,
      },
      {
        label: "布丁晃晃软",
        tail: 1,
      },
      {
        label: "奶味慢慢化",
        tail: 2,
      },
    ],
  },
  {
    key: "water-9",
    name: "樱桃奶油米布丁",
    image: "assets/watercolor/water-9.webp",
    options: [
      {
        label: "樱桃酸得好妙",
        tail: 0,
      },
      {
        label: "米粒糯糯的",
        tail: 1,
      },
      {
        label: "奶香好温柔",
        tail: 2,
      },
    ],
  },
  {
    key: "water-10",
    name: "焦糖梨子酥",
    image: "assets/watercolor/water-10.webp",
    options: [
      {
        label: "梨子软软有汁",
        tail: 0,
      },
      {
        label: "酥皮咔咔响",
        tail: 1,
      },
      {
        label: "焦糖微苦好香",
        tail: 2,
      },
    ],
  },
  {
    key: "water-11",
    name: "开心果花环面包",
    image: "assets/watercolor/water-11.webp",
    options: [
      {
        label: "开心果香浓浓",
        tail: 0,
      },
      {
        label: "面包软软拉丝",
        tail: 1,
      },
      {
        label: "糖霜甜得刚好",
        tail: 2,
      },
    ],
  },
  {
    key: "water-12",
    name: "橘子雪葩杯",
    image: "assets/watercolor/water-12.webp",
    options: [
      {
        label: "橘子清酸好醒神",
        tail: 0,
      },
      {
        label: "冰沙细细的",
        tail: 1,
      },
      {
        label: "果香留在嘴里",
        tail: 2,
      },
    ],
  },
  {
    key: "water-13",
    name: "红茶蝴蝶结司康",
    image: "assets/watercolor/water-13.webp",
    options: [
      {
        label: "红茶香先来了",
        tail: 0,
      },
      {
        label: "司康松松酥酥",
        tail: 1,
      },
      {
        label: "黄油暖暖香",
        tail: 2,
      },
    ],
  },
  {
    key: "water-14",
    name: "覆盆子奶油杯",
    image: "assets/watercolor/water-14.webp",
    options: [
      {
        label: "覆盆子微微酸",
        tail: 0,
      },
      {
        label: "奶油滑滑的",
        tail: 1,
      },
      {
        label: "果酱浓得挂勺",
        tail: 2,
      },
    ],
  },
  {
    key: "water-15",
    name: "椰子小月饼",
    image: "assets/watercolor/water-15.webp",
    options: [
      {
        label: "椰香奶奶的",
        tail: 0,
      },
      {
        label: "饼皮软软糯糯",
        tail: 1,
      },
      {
        label: "馅心细得很",
        tail: 2,
      },
    ],
  },
  {
    key: "water-16",
    name: "香芋贝壳蛋糕",
    image: "assets/watercolor/water-16.webp",
    options: [
      {
        label: "香芋绵密好乖",
        tail: 0,
      },
      {
        label: "蛋糕轻轻软",
        tail: 1,
      },
      {
        label: "奶油甜而不腻",
        tail: 2,
      },
    ],
  },
  {
    key: "water-17",
    name: "草莓奶油华夫碗",
    image: "assets/watercolor/water-17.webp",
    options: [
      {
        label: "草莓一咬出汁",
        tail: 0,
      },
      {
        label: "华夫碗咔嚓响",
        tail: 1,
      },
      {
        label: "奶油凉凉软软",
        tail: 2,
      },
    ],
  },
  {
    key: "water-18",
    name: "杏子果酱可颂",
    image: "assets/watercolor/water-18.webp",
    options: [
      {
        label: "杏子酸甜浓浓",
        tail: 0,
      },
      {
        label: "可颂层层酥",
        tail: 1,
      },
      {
        label: "黄油香得很",
        tail: 2,
      },
    ],
  },
  {
    key: "water-19",
    name: "黑芝麻月亮团子",
    image: "assets/watercolor/water-19.webp",
    options: [
      {
        label: "芝麻香好浓",
        tail: 0,
      },
      {
        label: "团子糯叽叽",
        tail: 1,
      },
      {
        label: "馅心细细流",
        tail: 2,
      },
    ],
  },
  {
    key: "water-20",
    name: "蜜瓜冰淇淋三明治",
    image: "assets/watercolor/water-20.webp",
    options: [
      {
        label: "蜜瓜清甜好香",
        tail: 0,
      },
      {
        label: "冰奶凉凉的",
        tail: 1,
      },
      {
        label: "饼皮酥酥松松",
        tail: 2,
      },
    ],
  },
  {
    key: "water-21",
    name: "紫葡萄奶酪塔",
    image: "assets/watercolor/water-21.webp",
    options: [
      {
        label: "葡萄脆甜多汁",
        tail: 0,
      },
      {
        label: "奶酪绵绵的",
        tail: 1,
      },
      {
        label: "挞底香香脆",
        tail: 2,
      },
    ],
  },
  {
    key: "water-22",
    name: "柚子云朵冻",
    image: "assets/watercolor/water-22.webp",
    options: [
      {
        label: "柚子微酸好清爽",
        tail: 0,
      },
      {
        label: "果冻晃晃的",
        tail: 1,
      },
      {
        label: "果香轻轻回甜",
        tail: 2,
      },
    ],
  },
  {
    key: "water-23",
    name: "南瓜猫耳奶糕",
    image: "assets/watercolor/water-23.webp",
    options: [
      {
        label: "南瓜细细甜",
        tail: 0,
      },
      {
        label: "奶糕软软的",
        tail: 1,
      },
      {
        label: "焦香留在嘴里",
        tail: 2,
      },
    ],
  },
  {
    key: "water-24",
    name: "奶油小熊玛德琳",
    image: "assets/watercolor/water-24.webp",
    options: [
      {
        label: "黄油香暖暖",
        tail: 0,
      },
      {
        label: "蛋糕边酥酥",
        tail: 1,
      },
      {
        label: "内心松松软",
        tail: 2,
      },
    ],
  },
  {
    key: "water-25",
    name: "白桃千层杯",
    image: "assets/watercolor/water-25.webp",
    options: [
      {
        label: "桃子好清甜",
        tail: 0,
      },
      {
        label: "薄饼层层软",
        tail: 1,
      },
      {
        label: "奶油滑得很",
        tail: 2,
      },
    ],
  },
  {
    key: "water-26",
    name: "桂花糯米卷",
    image: "assets/watercolor/water-26.webp",
    options: [
      {
        label: "桂花香清清的",
        tail: 0,
      },
      {
        label: "糯皮弹弹软",
        tail: 1,
      },
      {
        label: "奶馅细细甜",
        tail: 2,
      },
    ],
  },
  {
    key: "water-27",
    name: "蓝莓奶酪贝果",
    image: "assets/watercolor/water-27.webp",
    options: [
      {
        label: "蓝莓酸甜刚好",
        tail: 0,
      },
      {
        label: "贝果越嚼越香",
        tail: 1,
      },
      {
        label: "奶酪绵绵的",
        tail: 2,
      },
    ],
  },
  {
    key: "water-28",
    name: "栗子奶油可丽饼",
    image: "assets/watercolor/water-28.webp",
    options: [
      {
        label: "栗蓉绵得化开",
        tail: 0,
      },
      {
        label: "薄饼软软香",
        tail: 1,
      },
      {
        label: "奶油轻轻甜",
        tail: 2,
      },
    ],
  },
  {
    key: "water-29",
    name: "玫瑰荔枝冰饮",
    image: "assets/watercolor/water-29.webp",
    options: [
      {
        label: "荔枝香清甜",
        tail: 0,
      },
      {
        label: "玫瑰香轻轻的",
        tail: 1,
      },
      {
        label: "冰凉好清爽",
        tail: 2,
      },
    ],
  },
  {
    key: "water-30",
    name: "焦糖苹果舒芙蕾",
    image: "assets/watercolor/water-30.webp",
    options: [
      {
        label: "苹果软软多汁",
        tail: 0,
      },
      {
        label: "舒芙蕾蓬蓬的",
        tail: 1,
      },
      {
        label: "焦糖苦甜刚好",
        tail: 2,
      },
    ],
  },
  {
    key: "water-31",
    name: "草莓星空奶昔",
    image: "assets/watercolor/water-31.webp",
    options: [
      {
        label: "草莓酸甜浓浓",
        tail: 0,
      },
      {
        label: "奶昔冰冰绵",
        tail: 1,
      },
      {
        label: "奶香留得好久",
        tail: 2,
      },
    ],
  },
];
export const SWEETS = dishes.map((d) => ({
  ...d,
  options: d.options.map((o) => ({
    label: o.label,
    text: o.label + tails[o.tail],
  })),
}));
export const MENU = [
  {
    id: "sweet",
    name: "女巫的甜品手账",
    sub: "七种甜味 · 一桌小坏心眼",
    dishes: SWEETS.slice(0, 16).map((d, id) => ({ ...d, id })),
  },
];
export function makeSweetTable() {
  const pool = [...SWEETS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return {
    ...MENU[0],
    dishes: pool.slice(0, 16).map((d, id) => ({ ...d, id })),
  };
}
