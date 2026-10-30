(() => {
  // src/core/engine.js
  function randomIndex(n) {
    if (!Number.isInteger(n) || n < 1 || n > 4294967296)
      throw new RangeError("Invalid random range");
    const x = new Uint32Array(1), limit = 4294967296 - 4294967296 % n;
    do {
      crypto.getRandomValues(x);
    } while (x[0] >= limit);
    return x[0] % n;
  }
  function chooseDish(ownPoison, eaten, count = 16, rng = randomIndex) {
    let choices = Array.from({ length: count }, (_, i) => i).filter(
      (i) => !eaten.includes(i) && i !== ownPoison
    );
    if (!choices.length)
      choices = Array.from({ length: count }, (_, i) => i).filter(
        (i) => !eaten.includes(i)
      );
    return choices.length ? choices[rng(choices.length)] : null;
  }
  function createRound(poison, first = 0, count = 16) {
    return {
      poison: [...poison],
      turn: first,
      eaten: [[], []],
      over: false,
      winner: null,
      count
    };
  }
  function eat(r, player, id2) {
    if (!r || r.over || ![0, 1].includes(player) || r.turn !== player || !Number.isInteger(id2) || id2 < 0 || id2 >= r.count || r.eaten.flat().includes(id2))
      return { ok: false };
    r.eaten[player].push(id2);
    const poisoned = r.poison.includes(id2);
    if (poisoned) {
      r.over = true;
      r.winner = 1 - player;
    }
    return { ok: true, poisoned, winner: r.winner };
  }
  function next(r) {
    if (!r.over) r.turn = 1 - r.turn;
    return r.turn;
  }

  // src/data/menu.js
  var tails = [
    "\uFF0C\u7B2C\u4E00\u53E3\u5C31\u628A\u9999\u6C14\u9001\u5230\u820C\u5C16\u4E86\u3002\u6162\u6162\u56BC\u8FD8\u80FD\u5C1D\u5230\u4E00\u70B9\u56DE\u751C\u3002\u5C0F\u53C9\u5B50\u5148\u522B\u6536\uFF0C\u6211\u624D\u521A\u548C\u5B83\u719F\u8D77\u6765\uFF01",
    "\uFF0C\u820C\u5C16\u8F7B\u8F7B\u4E00\u538B\uFF0C\u53E3\u611F\u5C31\u6563\u5F00\u6765\uFF0C\u9999\u5473\u8FD8\u7559\u5728\u5634\u91CC\u3002\u54FC\u54FC\uFF0C\u5634\u4E0A\u8BF4\u53EA\u5C1D\u4E00\u70B9\uFF0C\u624B\u5DF2\u7ECF\u5077\u5077\u51C6\u5907\u4E0B\u4E00\u52FA\u3002",
    "\uFF0C\u8FD9\u4E00\u53E3\u7684\u751C\u5EA6\u521A\u597D\uFF0C\u54BD\u4E0B\u53BB\u8FD8\u60F3\u62BF\u62BF\u5634\u3002\u597D\u5403\u5F97\u5E3D\u5B50\u90FD\u60F3\u6643\u4E24\u4E0B\uFF0C\u5148\u522B\u76EF\u7740\u6211\u7B11\u561B\uFF01"
  ];
  var dishes = [
    {
      key: "water-0",
      name: "\u8349\u8393\u6708\u7259\u6CE1\u8299",
      image: "assets/watercolor/water-0.webp",
      options: [
        {
          label: "\u9165\u76AE\u8F7B\u8F7B\u788E",
          tail: 0
        },
        {
          label: "\u8349\u8393\u9178\u9178\u751C\u751C",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u8F6F\u5F97\u597D\u4E56",
          tail: 2
        }
      ]
    },
    {
      key: "water-1",
      name: "\u767D\u6843\u732B\u722A\u6155\u65AF",
      image: "assets/watercolor/water-1.webp",
      options: [
        {
          label: "\u6843\u9999\u597D\u6E05\u751C",
          tail: 0
        },
        {
          label: "\u6155\u65AF\u4E00\u62BF\u5C31\u5316",
          tail: 1
        },
        {
          label: "\u997C\u5E72\u5E95\u9165\u9165",
          tail: 2
        }
      ]
    },
    {
      key: "water-2",
      name: "\u5357\u74DC\u5976\u6CB9\u5377",
      image: "assets/watercolor/water-2.webp",
      options: [
        {
          label: "\u5357\u74DC\u9999\u6696\u6696",
          tail: 0
        },
        {
          label: "\u86CB\u7CD5\u7EF5\u7EF5\u8F6F\u8F6F",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u5377\u597D\u8F7B",
          tail: 2
        }
      ]
    },
    {
      key: "water-3",
      name: "\u84DD\u8393\u661F\u661F\u631E",
      image: "assets/watercolor/water-3.webp",
      options: [
        {
          label: "\u84DD\u8393\u54AC\u51FA\u679C\u6C41",
          tail: 0
        },
        {
          label: "\u631E\u58F3\u5494\u5693\u54CD",
          tail: 1
        },
        {
          label: "\u5976\u916A\u9178\u751C\u521A\u597D",
          tail: 2
        }
      ]
    },
    {
      key: "water-4",
      name: "\u6842\u82B1\u5976\u51BB",
      image: "assets/watercolor/water-4.webp",
      options: [
        {
          label: "\u6842\u82B1\u9999\u6162\u6162\u6765",
          tail: 0
        },
        {
          label: "\u5976\u51BB\u6ED1\u6E9C\u6E9C",
          tail: 1
        },
        {
          label: "\u751C\u5473\u597D\u6E05\u723D",
          tail: 2
        }
      ]
    },
    {
      key: "water-5",
      name: "\u6817\u5B50\u5C0F\u5C71\u86CB\u7CD5",
      image: "assets/watercolor/water-5.webp",
      options: [
        {
          label: "\u6817\u84C9\u7EF5\u5F97\u5F88",
          tail: 0
        },
        {
          label: "\u86CB\u7CD5\u677E\u677E\u8F6F\u8F6F",
          tail: 1
        },
        {
          label: "\u575A\u679C\u9999\u597D\u6D53",
          tail: 2
        }
      ]
    },
    {
      key: "water-6",
      name: "\u8461\u8404\u6C7D\u6C34\u676F",
      image: "assets/watercolor/water-6.webp",
      options: [
        {
          label: "\u8461\u8404\u679C\u5473\u8DB3",
          tail: 0
        },
        {
          label: "\u6C14\u6CE1\u8F7B\u8F7B\u8DF3",
          tail: 1
        },
        {
          label: "\u51B0\u51C9\u53C8\u6E05\u723D",
          tail: 2
        }
      ]
    },
    {
      key: "water-7",
      name: "\u8702\u871C\u4E91\u6735\u677E\u997C",
      image: "assets/watercolor/water-7.webp",
      options: [
        {
          label: "\u677E\u997C\u84EC\u84EC\u7684",
          tail: 0
        },
        {
          label: "\u8702\u871C\u9999\u751C\u751C",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u50CF\u5C0F\u4E91",
          tail: 2
        }
      ]
    },
    {
      key: "water-8",
      name: "\u7D2B\u85AF\u5E7D\u7075\u5E03\u4E01",
      image: "assets/watercolor/water-8.webp",
      options: [
        {
          label: "\u7D2B\u85AF\u751C\u9999\u6D53",
          tail: 0
        },
        {
          label: "\u5E03\u4E01\u6643\u6643\u8F6F",
          tail: 1
        },
        {
          label: "\u5976\u5473\u6162\u6162\u5316",
          tail: 2
        }
      ]
    },
    {
      key: "water-9",
      name: "\u6A31\u6843\u5976\u6CB9\u7C73\u5E03\u4E01",
      image: "assets/watercolor/water-9.webp",
      options: [
        {
          label: "\u6A31\u6843\u9178\u5F97\u597D\u5999",
          tail: 0
        },
        {
          label: "\u7C73\u7C92\u7CEF\u7CEF\u7684",
          tail: 1
        },
        {
          label: "\u5976\u9999\u597D\u6E29\u67D4",
          tail: 2
        }
      ]
    },
    {
      key: "water-10",
      name: "\u7126\u7CD6\u68A8\u5B50\u9165",
      image: "assets/watercolor/water-10.webp",
      options: [
        {
          label: "\u68A8\u5B50\u8F6F\u8F6F\u6709\u6C41",
          tail: 0
        },
        {
          label: "\u9165\u76AE\u5494\u5494\u54CD",
          tail: 1
        },
        {
          label: "\u7126\u7CD6\u5FAE\u82E6\u597D\u9999",
          tail: 2
        }
      ]
    },
    {
      key: "water-11",
      name: "\u5F00\u5FC3\u679C\u82B1\u73AF\u9762\u5305",
      image: "assets/watercolor/water-11.webp",
      options: [
        {
          label: "\u5F00\u5FC3\u679C\u9999\u6D53\u6D53",
          tail: 0
        },
        {
          label: "\u9762\u5305\u8F6F\u8F6F\u62C9\u4E1D",
          tail: 1
        },
        {
          label: "\u7CD6\u971C\u751C\u5F97\u521A\u597D",
          tail: 2
        }
      ]
    },
    {
      key: "water-12",
      name: "\u6A58\u5B50\u96EA\u8469\u676F",
      image: "assets/watercolor/water-12.webp",
      options: [
        {
          label: "\u6A58\u5B50\u6E05\u9178\u597D\u9192\u795E",
          tail: 0
        },
        {
          label: "\u51B0\u6C99\u7EC6\u7EC6\u7684",
          tail: 1
        },
        {
          label: "\u679C\u9999\u7559\u5728\u5634\u91CC",
          tail: 2
        }
      ]
    },
    {
      key: "water-13",
      name: "\u7EA2\u8336\u8774\u8776\u7ED3\u53F8\u5EB7",
      image: "assets/watercolor/water-13.webp",
      options: [
        {
          label: "\u7EA2\u8336\u9999\u5148\u6765\u4E86",
          tail: 0
        },
        {
          label: "\u53F8\u5EB7\u677E\u677E\u9165\u9165",
          tail: 1
        },
        {
          label: "\u9EC4\u6CB9\u6696\u6696\u9999",
          tail: 2
        }
      ]
    },
    {
      key: "water-14",
      name: "\u8986\u76C6\u5B50\u5976\u6CB9\u676F",
      image: "assets/watercolor/water-14.webp",
      options: [
        {
          label: "\u8986\u76C6\u5B50\u5FAE\u5FAE\u9178",
          tail: 0
        },
        {
          label: "\u5976\u6CB9\u6ED1\u6ED1\u7684",
          tail: 1
        },
        {
          label: "\u679C\u9171\u6D53\u5F97\u6302\u52FA",
          tail: 2
        }
      ]
    },
    {
      key: "water-15",
      name: "\u6930\u5B50\u5C0F\u6708\u997C",
      image: "assets/watercolor/water-15.webp",
      options: [
        {
          label: "\u6930\u9999\u5976\u5976\u7684",
          tail: 0
        },
        {
          label: "\u997C\u76AE\u8F6F\u8F6F\u7CEF\u7CEF",
          tail: 1
        },
        {
          label: "\u9985\u5FC3\u7EC6\u5F97\u5F88",
          tail: 2
        }
      ]
    },
    {
      key: "water-16",
      name: "\u9999\u828B\u8D1D\u58F3\u86CB\u7CD5",
      image: "assets/watercolor/water-16.webp",
      options: [
        {
          label: "\u9999\u828B\u7EF5\u5BC6\u597D\u4E56",
          tail: 0
        },
        {
          label: "\u86CB\u7CD5\u8F7B\u8F7B\u8F6F",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u751C\u800C\u4E0D\u817B",
          tail: 2
        }
      ]
    },
    {
      key: "water-17",
      name: "\u8349\u8393\u5976\u6CB9\u534E\u592B\u7897",
      image: "assets/watercolor/water-17.webp",
      options: [
        {
          label: "\u8349\u8393\u4E00\u54AC\u51FA\u6C41",
          tail: 0
        },
        {
          label: "\u534E\u592B\u7897\u5494\u5693\u54CD",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u51C9\u51C9\u8F6F\u8F6F",
          tail: 2
        }
      ]
    },
    {
      key: "water-18",
      name: "\u674F\u5B50\u679C\u9171\u53EF\u9882",
      image: "assets/watercolor/water-18.webp",
      options: [
        {
          label: "\u674F\u5B50\u9178\u751C\u6D53\u6D53",
          tail: 0
        },
        {
          label: "\u53EF\u9882\u5C42\u5C42\u9165",
          tail: 1
        },
        {
          label: "\u9EC4\u6CB9\u9999\u5F97\u5F88",
          tail: 2
        }
      ]
    },
    {
      key: "water-19",
      name: "\u9ED1\u829D\u9EBB\u6708\u4EAE\u56E2\u5B50",
      image: "assets/watercolor/water-19.webp",
      options: [
        {
          label: "\u829D\u9EBB\u9999\u597D\u6D53",
          tail: 0
        },
        {
          label: "\u56E2\u5B50\u7CEF\u53FD\u53FD",
          tail: 1
        },
        {
          label: "\u9985\u5FC3\u7EC6\u7EC6\u6D41",
          tail: 2
        }
      ]
    },
    {
      key: "water-20",
      name: "\u871C\u74DC\u51B0\u6DC7\u6DCB\u4E09\u660E\u6CBB",
      image: "assets/watercolor/water-20.webp",
      options: [
        {
          label: "\u871C\u74DC\u6E05\u751C\u597D\u9999",
          tail: 0
        },
        {
          label: "\u51B0\u5976\u51C9\u51C9\u7684",
          tail: 1
        },
        {
          label: "\u997C\u76AE\u9165\u9165\u677E\u677E",
          tail: 2
        }
      ]
    },
    {
      key: "water-21",
      name: "\u7D2B\u8461\u8404\u5976\u916A\u5854",
      image: "assets/watercolor/water-21.webp",
      options: [
        {
          label: "\u8461\u8404\u8106\u751C\u591A\u6C41",
          tail: 0
        },
        {
          label: "\u5976\u916A\u7EF5\u7EF5\u7684",
          tail: 1
        },
        {
          label: "\u631E\u5E95\u9999\u9999\u8106",
          tail: 2
        }
      ]
    },
    {
      key: "water-22",
      name: "\u67DA\u5B50\u4E91\u6735\u51BB",
      image: "assets/watercolor/water-22.webp",
      options: [
        {
          label: "\u67DA\u5B50\u5FAE\u9178\u597D\u6E05\u723D",
          tail: 0
        },
        {
          label: "\u679C\u51BB\u6643\u6643\u7684",
          tail: 1
        },
        {
          label: "\u679C\u9999\u8F7B\u8F7B\u56DE\u751C",
          tail: 2
        }
      ]
    },
    {
      key: "water-23",
      name: "\u5357\u74DC\u732B\u8033\u5976\u7CD5",
      image: "assets/watercolor/water-23.webp",
      options: [
        {
          label: "\u5357\u74DC\u7EC6\u7EC6\u751C",
          tail: 0
        },
        {
          label: "\u5976\u7CD5\u8F6F\u8F6F\u7684",
          tail: 1
        },
        {
          label: "\u7126\u9999\u7559\u5728\u5634\u91CC",
          tail: 2
        }
      ]
    },
    {
      key: "water-24",
      name: "\u5976\u6CB9\u5C0F\u718A\u739B\u5FB7\u7433",
      image: "assets/watercolor/water-24.webp",
      options: [
        {
          label: "\u9EC4\u6CB9\u9999\u6696\u6696",
          tail: 0
        },
        {
          label: "\u86CB\u7CD5\u8FB9\u9165\u9165",
          tail: 1
        },
        {
          label: "\u5185\u5FC3\u677E\u677E\u8F6F",
          tail: 2
        }
      ]
    },
    {
      key: "water-25",
      name: "\u767D\u6843\u5343\u5C42\u676F",
      image: "assets/watercolor/water-25.webp",
      options: [
        {
          label: "\u6843\u5B50\u597D\u6E05\u751C",
          tail: 0
        },
        {
          label: "\u8584\u997C\u5C42\u5C42\u8F6F",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u6ED1\u5F97\u5F88",
          tail: 2
        }
      ]
    },
    {
      key: "water-26",
      name: "\u6842\u82B1\u7CEF\u7C73\u5377",
      image: "assets/watercolor/water-26.webp",
      options: [
        {
          label: "\u6842\u82B1\u9999\u6E05\u6E05\u7684",
          tail: 0
        },
        {
          label: "\u7CEF\u76AE\u5F39\u5F39\u8F6F",
          tail: 1
        },
        {
          label: "\u5976\u9985\u7EC6\u7EC6\u751C",
          tail: 2
        }
      ]
    },
    {
      key: "water-27",
      name: "\u84DD\u8393\u5976\u916A\u8D1D\u679C",
      image: "assets/watercolor/water-27.webp",
      options: [
        {
          label: "\u84DD\u8393\u9178\u751C\u521A\u597D",
          tail: 0
        },
        {
          label: "\u8D1D\u679C\u8D8A\u56BC\u8D8A\u9999",
          tail: 1
        },
        {
          label: "\u5976\u916A\u7EF5\u7EF5\u7684",
          tail: 2
        }
      ]
    },
    {
      key: "water-28",
      name: "\u6817\u5B50\u5976\u6CB9\u53EF\u4E3D\u997C",
      image: "assets/watercolor/water-28.webp",
      options: [
        {
          label: "\u6817\u84C9\u7EF5\u5F97\u5316\u5F00",
          tail: 0
        },
        {
          label: "\u8584\u997C\u8F6F\u8F6F\u9999",
          tail: 1
        },
        {
          label: "\u5976\u6CB9\u8F7B\u8F7B\u751C",
          tail: 2
        }
      ]
    },
    {
      key: "water-29",
      name: "\u73AB\u7470\u8354\u679D\u51B0\u996E",
      image: "assets/watercolor/water-29.webp",
      options: [
        {
          label: "\u8354\u679D\u9999\u6E05\u751C",
          tail: 0
        },
        {
          label: "\u73AB\u7470\u9999\u8F7B\u8F7B\u7684",
          tail: 1
        },
        {
          label: "\u51B0\u51C9\u597D\u6E05\u723D",
          tail: 2
        }
      ]
    },
    {
      key: "water-30",
      name: "\u7126\u7CD6\u82F9\u679C\u8212\u8299\u857E",
      image: "assets/watercolor/water-30.webp",
      options: [
        {
          label: "\u82F9\u679C\u8F6F\u8F6F\u591A\u6C41",
          tail: 0
        },
        {
          label: "\u8212\u8299\u857E\u84EC\u84EC\u7684",
          tail: 1
        },
        {
          label: "\u7126\u7CD6\u82E6\u751C\u521A\u597D",
          tail: 2
        }
      ]
    },
    {
      key: "water-31",
      name: "\u8349\u8393\u661F\u7A7A\u5976\u6614",
      image: "assets/watercolor/water-31.webp",
      options: [
        {
          label: "\u8349\u8393\u9178\u751C\u6D53\u6D53",
          tail: 0
        },
        {
          label: "\u5976\u6614\u51B0\u51B0\u7EF5",
          tail: 1
        },
        {
          label: "\u5976\u9999\u7559\u5F97\u597D\u4E45",
          tail: 2
        }
      ]
    }
  ];
  var SWEETS = dishes.map((d) => ({
    ...d,
    options: d.options.map((o) => ({
      label: o.label,
      text: o.label + tails[o.tail]
    }))
  }));
  var MENU = [
    {
      id: "sweet",
      name: "\u5973\u5DEB\u7684\u751C\u54C1\u624B\u8D26",
      sub: "\u4E03\u79CD\u751C\u5473 \xB7 \u4E00\u684C\u5C0F\u574F\u5FC3\u773C",
      dishes: SWEETS.slice(0, 16).map((d, id2) => ({ ...d, id: id2 }))
    }
  ];
  function makeSweetTable() {
    const pool = [...SWEETS];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return {
      ...MENU[0],
      dishes: pool.slice(0, 16).map((d, id2) => ({ ...d, id: id2 }))
    };
  }

  // src/core/persistence.js
  var KEYS = {
    db: "witch-halloween-v2",
    slots: "witch-manual-saves-v1",
    auto: "witch-auto-save-v1"
  };
  var modes = ["solo", "local", "online"];
  var keySet = new Set(SWEETS.map((d) => d.key));
  var clone = (value) => JSON.parse(JSON.stringify(value));
  var integer = (n, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n >= 0 && n <= max;
  var text = (s, max = 2e3) => typeof s === "string" && s.length <= max;
  var pair = (v) => Array.isArray(v) && v.length === 2;
  var defaultDb = () => ({
    scores: { solo: [0, 0], local: [0, 0], online: [0, 0] },
    rounds: { solo: 0, local: 0, online: 0 },
    notes: [],
    names: ["\u5C0F\u5357\u74DC", "\u5C0F\u6708\u4EAE"]
  });
  function storage() {
    return globalThis.localStorage;
  }
  function read(key, fallback) {
    try {
      return JSON.parse(storage().getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      storage().setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  function validNote(n) {
    return n && text(n.theme, 30) && integer(n.id, 31) && integer(n.k, 2) && text(n.label, 120) && text(n.text) && text(n.name, 30) && (n.image == null || typeof n.image === "string" && /^assets\/[\w/-]+\.(webp|png)$/.test(n.image)) && (n.dishName == null || text(n.dishName, 80)) && typeof n.hit === "boolean";
  }
  function validDb(d) {
    return d && pair(d.names) && d.names.every((n) => text(n, 30)) && modes.every(
      (m) => pair(d.scores?.[m]) && d.scores[m].every((n) => integer(n)) && integer(d.rounds?.[m])
    ) && Array.isArray(d.notes) && d.notes.length <= 100 && d.notes.every(validNote);
  }
  function normalizeDb(raw) {
    const d = defaultDb();
    if (!raw || typeof raw !== "object") return d;
    for (const m of modes) {
      if (pair(raw.scores?.[m]) && raw.scores[m].every((n) => integer(n)))
        d.scores[m] = [...raw.scores[m]];
      if (integer(raw.rounds?.[m])) d.rounds[m] = raw.rounds[m];
    }
    if (pair(raw.names) && raw.names.every((n) => text(n, 30)))
      d.names = raw.names.map(
        (n) => n === "\u6708\u89C1\u5973\u5DEB" ? "\u5C0F\u6708\u4EAE" : n || "\u5C0F\u5973\u5DEB"
      );
    if (Array.isArray(raw.notes))
      d.notes = raw.notes.filter(validNote).slice(0, 100);
    return d;
  }
  function loadDb() {
    return normalizeDb(read(KEYS.db, null) || read("witch-banquet-v1", null));
  }
  var persistDb = (d) => write(KEYS.db, d);
  function snapshot(s) {
    if (s.mode === "online") return null;
    return clone({
      version: 1,
      at: Date.now(),
      mode: s.mode,
      db: s.db,
      themeKeys: s.theme.dishes.map((d) => d.key),
      phase: s.phase,
      r: s.r,
      log: s.r ? s.log : [],
      taste: s.taste,
      scored: s.scored
    });
  }
  function validSnap(v) {
    if (!v || v.version !== 1 || !["solo", "local"].includes(v.mode) || !integer(v.at) || !validDb(v.db) || !Array.isArray(v.themeKeys) || v.themeKeys.length !== 16 || new Set(v.themeKeys).size !== 16 || !v.themeKeys.every((k) => keySet.has(k)) || !Array.isArray(v.log) || v.log.length > 16)
      return false;
    if (v.r === null)
      return v.log.every(
        (l) => l && integer(l.id, 15) && integer(l.k, 2) && [0, 1].includes(l.player) && typeof l.hit === "boolean"
      );
    const r = v.r;
    if (!r || r.count !== 16 || !pair(r.poison) || !r.poison.every((n) => integer(n, 15)) || ![0, 1].includes(r.turn) || !pair(r.eaten) || !r.eaten.every(Array.isArray) || new Set(r.eaten.flat()).size !== r.eaten.flat().length || !r.eaten.flat().every((n) => integer(n, 15)) || typeof r.over !== "boolean")
      return false;
    if (!v.log.every(
      (l) => l && integer(l.id, 15) && integer(l.k, 2) && [0, 1].includes(l.player) && typeof l.hit === "boolean"
    ))
      return false;
    const replay = createRound(r.poison, v.log[0]?.player ?? r.turn);
    for (let i = 0; i < v.log.length; i++) {
      const l = v.log[i], result = eat(replay, l.player, l.id);
      if (!result.ok || result.poisoned !== l.hit) return false;
      if (i < v.log.length - 1) next(replay);
    }
    if (JSON.stringify(replay.eaten) !== JSON.stringify(r.eaten) || replay.over !== r.over || replay.winner !== r.winner)
      return false;
    const last = v.log.at(-1);
    if (r.over) return r.turn === last?.player;
    const turn = last ? v.taste?.resolved ? last.player : 1 - last.player : r.turn;
    return r.turn === turn;
  }
  function readSlots() {
    const raw = read(KEYS.slots, []);
    return Array.from(
      { length: 3 },
      (_, i) => validSnap(raw?.[i]) ? raw[i] : null
    );
  }
  var writeSlots = (v) => write(KEYS.slots, v);
  function readAuto() {
    const v = read(KEYS.auto, null);
    return validSnap(v) ? v : null;
  }
  var writeAuto = (v) => write(KEYS.auto, v);
  function removeAuto() {
    try {
      storage().removeItem(KEYS.auto);
      return true;
    } catch {
      return false;
    }
  }
  function exportBackup(s) {
    return {
      format: "witch-supper-backup",
      version: 1,
      slots: readSlots(),
      auto: readAuto(),
      current: snapshot(s)
    };
  }
  function parseBackup(source) {
    const v = JSON.parse(source);
    if (v.format !== "witch-supper-backup" || v.version !== 1 || !Array.isArray(v.slots) || v.slots.length !== 3 || !v.slots.every((s) => s === null || validSnap(s)) || v.auto != null && !validSnap(v.auto) || v.current != null && !validSnap(v.current))
      throw new Error("Invalid backup");
    return clone(v);
  }
  function importBackup(v) {
    const before = readSlots(), auto = readAuto();
    if (!writeSlots(v.slots)) return false;
    const ok = v.auto || v.current ? writeAuto(v.auto || v.current) : removeAuto();
    if (!ok) {
      writeSlots(before);
      auto ? writeAuto(auto) : removeAuto();
    }
    return ok;
  }

  // src/core/state.js
  var state = {
    db: loadDb(),
    theme: MENU[0],
    mode: "solo",
    phase: "home",
    selecting: 0,
    selected: null,
    secrets: [null, null],
    r: null,
    log: [],
    taste: null,
    scored: false,
    epoch: 0,
    transitioning: false,
    network: {
      peer: null,
      conn: null,
      roomCode: "",
      netSlot: 0,
      netNames: null,
      netConnected: false,
      netSeq: 0,
      myCommit: null,
      theirCommit: null,
      mySalt: null,
      mySecret: null,
      onlineStarted: false,
      joinTimer: null,
      generation: 0,
      verified: false,
      sessionScores: [0, 0]
    }
  };
  var net = state.network;

  // src/ui/helpers.js
  var $ = (id2) => document.getElementById(id2);
  var esc = (s) => String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
  var asset = (p) => window.SUPPER_ASSETS?.[p] || p;
  var pad = (n) => String(n).padStart(2, "0");
  var H = "assets/halloween/";
  function names() {
    return state.mode === "solo" ? [state.db.names[0], "\u5C0F\u6708\u4EAE"] : state.mode === "online" && net.netNames ? net.netNames : state.db.names;
  }
  function avatar(p, cls = "") {
    return `<img class="avatar ${cls}" src="${asset(H + (p === 0 ? "avatar-you.webp" : "avatar-witch.webp"))}" alt="${p === 0 ? "\u5357\u74DC\u5E3D\u5973\u5DEB\u89D2\u8272" : "\u5C0F\u6708\u4EAE\u89D2\u8272"}">`;
  }
  function sticker(n, cls = "") {
    return `<img class="sticker ${cls}" src="${asset("assets/journal-v5/" + n + ".png")}" alt="" aria-hidden="true">`;
  }
  function photo(id2, t = state.theme) {
    let d = t.dishes[id2];
    if (d.image)
      return `<img class="food-photo" src="${asset(d.image)}" alt="${esc(d.name)}">`;
    return `<span class="food-photo" role="img" aria-label="${esc(d.name)}" style="--atlas:url('${asset("assets/" + t.id + ".webp")}');--px:${id2 % 4 * 100 / 3}%;--py:${Math.floor(id2 / 4) * 100 / 3}%"></span>`;
  }

  // src/ui/screens.js
  function homeView(n, s) {
    return `<section class="home-scene"><div class="welcome"><span class="eyebrow">OCTOBER 31 \xB7 A TABLE FOR TWO</span><h1>\u5973\u5DEB\u7684\u6BD2\u836F</h1><div class="script">A little bite of magic</div><p>\u809A\u5B50\u8BF4\uFF1A\u5F00\u996D\uFF01\u8111\u5B50\u8BF4\uFF1A\u6709\u8BC8\uFF01<br>\u4E24\u4F4D\u5634\u786C\u5973\u5DEB\uFF0C\u4E00\u684C\u8F6F\u4E4E\u751C\u54C1\u3002<br>\u8C01\u5148\u4E2D\u62DB\uFF0C\u8C01\u8D1F\u8D23\u53EF\u6076\uFF01\uFF01\uFF01</p><span class="scene-label">\u2727 \u5357\u74DC\u706F\u4E0B\u7684\u79D8\u5BC6\u665A\u9910 \u2727</span>${sticker("cat", "little-cat")}${sticker("lantern", "mini-lantern")}</div><section class="invitation-book"><div class="book-heading"><span class="eyebrow">YOU ARE CORDIALLY INVITED</span><h2>\u5634\u998B\u7684\u5973\u5DEB\uFF0C\u96C6\u5408\uFF01</h2><span class="script">Trick, treat & a tiny secret</span><p class="tiny">\u53CB\u8C0A\u7B2C\u4E00\uFF0C\u5077\u653E\u6BD2\u836F\u7B2C\u96F6\u3002</p></div>${sticker("purple-hat", "book-corner")}<div class="seat-pair duel-deck">${[0, 1].map((p) => `<button class="witch-card card-${p}" data-character="${p}" aria-label="\u7FFB\u770B${esc(n[p])}\u7684\u89D2\u8272\u5361"><span class="card-rotator"><span class="card-face card-front"><small>${p ? "MOON WITCH" : "PUMPKIN WITCH"}</small>${avatar(p)}<b>${esc(n[p])}</b><em>${p ? "\u4E56\u5DE7\uFF0C\u4F46\u6709\u8BC8" : "\u53EF\u7231\uFF0C\u4E14\u80FD\u5403"}</em><i>\u2726 ${p ? "\u6708\u4EAE\u9635\u8425" : "\u5357\u74DC\u9635\u8425"} \u2726</i></span><span class="card-face card-back">\u263E<b>${p ? "\u4E00\u809A\u5B50\u574F\u6C34" : "\u4E00\u809A\u5B50\u751C\u54C1"}</b><small>\u70B9\u4E00\u4E0B\uFF0C\u5973\u5DEB\u56DE\u6765\u5566</small></span></span></button>`).join("")}<span class="duel-vs">VS</span></div><button class="menu-ticket" id="chooseMenu"><span class="mini-photo">${photo(0)}</span><span><strong>${state.theme.name}</strong><small>\u9B54\u6CD5\u751C\u5473 \xB7 \u6BCF\u5C40\u968F\u673A\u4E0A 16 \u4EFD</small></span><span class="change">\u5077\u770B\u751C\u54C1</span></button><div class="mode-selector" role="group" aria-label="\u6E38\u620F\u6A21\u5F0F">${[
      ["solo", "\u548C\u5973\u5DEB\u73A9"],
      ["local", "\u53CC\u4EBA\u540C\u5C4F"],
      ["online", "\u53CC\u4EBA\u8054\u673A"]
    ].map(
      ([m, t]) => `<button data-mode="${m}" class="${state.mode === m ? "active" : ""}" aria-pressed="${state.mode === m}">${t}</button>`
    ).join(
      ""
    )}</div><button class="btn-gold book-action" id="startGame">${state.mode === "online" ? "\u70B9\u4EAE\u623F\u95F4\uFF0C\u9080\u8BF7\u5BF9\u684C" : "\u5C0F\u53C9\u5B50\u4E3E\u8D77\u6765 \xB7 \u5F00\u70AB\uFF01"} <span aria-hidden="true">\u2727</span></button><p class="book-help">${state.mode === "solo" ? "\u5973\u5DEB\u4F1A\u72EC\u7ACB\u85CF\u597D\u6BD2\u836F\uFF0C\u4E0E\u4F60\u8F6E\u6D41\u52A8\u7B77\u3002" : state.mode === "local" ? "\u4E00\u4EBA\u4E00\u4EFD\u79D8\u5BC6\uFF0C\u5C01\u597D\u540E\u81EA\u52A8\u906E\u4F4F\u684C\u9762\u3002" : "\u4E24\u53F0\u8BBE\u5907\uFF0C\u540C\u4E00\u623F\u95F4\u3002\u5404\u81EA\u9009\u6BD2\uFF0C\u5B9E\u65F6\u52A8\u7B77\u3002"}</p><div class="score-ribbon"><span>${esc(n[0])}<b>${s[0]}</b></span><span>\u2727</span><span>${esc(n[1])}<b>${s[1]}</b></span><button class="text-button" id="scores">\u79EF\u5206\u7C3F</button></div>${sticker("cupcake", "book-sticker")}</section></section>`;
  }
  function handoffView(p, title, text2, label, namesForm) {
    return `<section class="handoff"><div class="handoff-card">${avatar(p)}<span class="script">A secret, just for you</span><h1>${title}</h1><p>${text2}</p>${namesForm ? `<div class="names"><label>\u7B2C\u4E00\u4F4D\u5973\u5DEB<input id="name0" aria-label="\u7B2C\u4E00\u4F4D\u5973\u5DEB\u7684\u540D\u5B57" maxlength="8" value="${esc(state.db.names[0])}"></label><label>\u7B2C\u4E8C\u4F4D\u5973\u5DEB<input id="name1" aria-label="\u7B2C\u4E8C\u4F4D\u5973\u5DEB\u7684\u540D\u5B57" maxlength="8" value="${esc(state.db.names[1])}"></label></div>` : ""}<button class="btn-purple" id="handoffGo">${label}</button><br><button class="text-button" id="handoffHome">\u5148\u56DE\u8BF7\u67EC\u770B\u770B</button><small>${state.mode === "online" ? "\u77ED\u6682\u6389\u7EBF\u4F1A\u5C1D\u8BD5\u63A5\u56DE\uFF0C\u8BF7\u4FDD\u7559\u8FD9\u4E2A\u7F51\u9875\u3002" : "\u5F00\u5BB4\u540E\u4F1A\u81EA\u52A8\u4FDD\u5B58\uFF0C\u53EF\u5728\u5B58\u6863\u62BD\u5C49\u6062\u590D\u3002"}</small>${sticker("ghost-lantern", "corner-ghost")}${sticker("potion", "corner-potion")}</div></section>`;
  }
  function heading(pickPhase = false) {
    return `<div class="stage-heading"><div><span class="eyebrow">HALLOWEEN SUPPER \xB7 ROUND ${pad(state.mode === "online" ? net.netSeq : (state.db.rounds[state.mode] || 0) + 1)}</span><h1>${state.theme.name}</h1></div><div class="stage-meta"><i class="status-dot"></i><span>${state.mode === "online" ? net.roomCode : pickPhase ? "\u79D8\u5BC6\u5C01\u5B58\u4E2D" : "\u9999\u6C14\u6B63\u597D"}</span><button id="leave">\u79BB\u5E2D</button></div></div>`;
  }
  function hud(p) {
    let n = names(), s = state.mode === "online" ? net.sessionScores : state.db.scores[state.mode];
    return `<div class="player-hud">${[0, 1].map((j) => `${j === 1 ? '<div class="vs-glyph">VS<small>SECRET DUEL</small></div>' : ""}<div class="player-card ${j ? "right" : ""} ${p === j ? "active" : ""}">${avatar(j)}<div><h3>${esc(n[j])}</h3><small>${p === j ? "\u9910\u5177\u5DF2\u62FF\u597D" : "\u7B49\u5BF9\u684C\u52A8\u7B77"}</small></div><span class="score">${s[j]}</span></div>`).join("")}</div>`;
  }
  function dish(d, secret = false) {
    const gone = !secret && state.r.eaten.flat().includes(d.id);
    return `<button class="dish ${gone ? "eaten" : ""} ${secret && state.selected === d.id ? "selected" : ""}" data-dish="${d.id}" ${gone || !secret && (state.mode === "solo" && state.r.turn === 1 || state.mode === "online" && (state.r.turn !== net.netSlot || !net.netConnected)) ? "disabled" : ""} ${secret ? `aria-pressed="${state.selected === d.id}"` : ""} aria-label="${esc(d.name)}\uFF0C${gone ? "\u5DF2\u7ECF\u5403\u8FC7" : secret ? "\u9009\u4E3A\u6BD2\u836F" : "\u54C1\u5C1D\u8FD9\u9053\u83DC"}" style="--tilt:${[-2, 2, -1, 3][d.id % 4]}deg"><span class="dish-no">${pad(d.id + 1)}</span><span class="porcelain">${gone ? '<span class="crumb"></span>' : photo(d.id)}</span><span class="dish-name">${gone ? "\u7A7A\u76D8 \xB7 " + (state.r.eaten[0].includes(d.id) ? esc(names()[0]) : esc(names()[1])) : d.name}</span></button>`;
  }
  function pickView() {
    return `<section class="stage">${heading(true)}<p class="privacy-notice">\u53EA\u6709 ${esc(names()[state.selecting])} \u53EF\u4EE5\u770B\u8FD9\u4E00\u9875 \xB7 \u786E\u8BA4\u540E\u4F1A\u7ACB\u5373\u906E\u4F4F\u9009\u62E9</p><div class="table-layout"><section class="dining-table"><div class="table-top"><h2>\u54EA\u4E00\u4EFD\u751C\u54C1\uFF0C\u8981\u88AB\u4F60\u65BD\u6CD5\uFF1F</h2><small>\u9009\u9519\u53EF\u4EE5\u518D\u70B9\u53E6\u4E00\u9053</small></div><div class="dishes">${state.theme.dishes.map((d) => dish(d, true)).join("")}</div>${sticker("hat", "table-sticker tl")}${sticker("treatbag", "table-sticker br")}</section><aside class="side-diary"><span class="script">Just between us</span><h3>${esc(names()[state.selecting])} \u7684\u9B54\u836F</h3><p class="intro">\u4E0D\u5FC5\u6311\u6700\u53EF\u7591\u7684\u90A3\u9053\u3002<br>\u4E5F\u8BB8\u5979\u6700\u60F3\u5403\u7684\uFF0C<br>\u624D\u662F\u4ECA\u665A\u7684\u5C0F\u5C0F\u5708\u5957\u3002</p>${sticker("cauldron", "aside-sticker")}<div class="secret-choice" role="status">${state.selected === null ? "\u5C0F\u574F\u5FC3\u773C\u6B63\u5728\u6311\u9009\u4E2D\u2026\u2026" : "\u5C31\u5B83\uFF01" + state.theme.dishes[state.selected].name}</div><button class="btn-purple" id="lockSecret" ${state.selected === null ? "disabled" : ""}>\u5C01\u597D\u79D8\u5BC6 ${state.mode === "online" ? "\xB7 \u7B49\u5BF9\u684C" : "\xB7 \u906E\u4F4F\u5C4F\u5E55"}</button><button class="text-button" id="cover">\u6709\u4EBA\u6765\u4E86\uFF0C\u5148\u906E\u4F4F</button><div class="diary-note">${state.mode === "online" ? net.theirCommit ? "\u5BF9\u684C\u5DF2\u7ECF\u5C01\u597D\u5979\u7684\u79D8\u5BC6\u3002" : "\u5BF9\u684C\u4E5F\u5728\u81EA\u5DF1\u7684\u5C4F\u5E55\u4E0A\u9009\u6BD2\u3002" : "\u4E0D\u7528\u5FF5\u51FA\u83DC\u540D\uFF0C\u70B9\u4E00\u4E0B\u5C31\u8BB0\u597D\u4E86\u3002"}<br>\u8BF7\u8BB0\u4F4F\u4F60\u9009\u7684\u4F4D\u7F6E\uFF0C\u8F6E\u5230\u81EA\u5DF1\u65F6\u53EF\u4EE5\u907F\u5F00\u3002</div></aside></div></section>`;
  }
  function boardView(p, n, left) {
    return `<section class="stage ${left <= 4 ? "danger-table" : ""}">${heading()}${hud(p)}<div class="table-layout"><section class="dining-table"><div class="table-top"><div><h2>${state.mode === "online" && p !== net.netSlot ? "\u5BF9\u684C\u6B63\u5728\u6311\u9009\u2026" : state.mode === "solo" && p === 1 ? "\u5979\u7684\u9910\u5177\u505C\u5728\u534A\u7A7A\u2026" : esc(n[p]) + "\uFF0C\u60F3\u5C1D\u54EA\u4E00\u9053\uFF1F"}</h2><p class="long-press-tip">${left <= 4 ? "\u7A7A\u76D8\u8D8A\u6765\u8D8A\u591A\uFF0C\u79D8\u5BC6\u5374\u8FD8\u5728\u3002" : "\u70B9\u4E00\u4E0B\u5448\u4E0A\u7F8E\u98DF\uFF0C\u4E5F\u53EF\u4EE5\u957F\u6309\u6162\u6162\u53D6\u98DF\u3002"}</p></div><span class="counter-pill">\u8FD8\u5269 ${left} \u9053</span></div><div class="dishes">${state.theme.dishes.map((d) => dish(d)).join("")}</div>${sticker("cat", "table-sticker tl")}${sticker("lantern", "table-sticker br")}${sticker("pumpkin-cat", "table-sticker bl")}</section><aside class="side-diary"><span class="script">Little delicious notes</span><h3>\u5634\u66FF\u8425\u4E1A\u4E2D</h3><p class="intro">${left <= 4 ? "\u53EA\u5269\u51E0\u9053\u4E86\u3002<br>\u5148\u95FB\u9999\uFF0C\u518D\u770B\u770B\u5BF9\u684C\u3002<br>\u5979\u600E\u4E48\u7A81\u7136\u7B11\u4E86\uFF1F" : "\u53C9\u5B50\u53EF\u4EE5\u6162\u4E00\u70B9\u3002<br>\u574F\u5FC3\u773C\u4E0D\u80FD\u592A\u660E\u663E\u3002<br>\u55EF\uFF1F\u4F60\u600E\u4E48\u7B11\u4E86\uFF01"}</p>${sticker(left <= 4 ? "potion" : "cake", "aside-sticker")}<div class="diary-note">${state.log.length ? state.log.slice(-2).map(
      (l) => `<b>${esc(n[l.player])}</b> \u5C1D\u4E86 ${state.theme.dishes[l.id].name}<br>\u201C${esc(l.label)}\u201D`
    ).join("<br><br>") : "\u76EE\u524D\u6218\u51B5\uFF1A<br>\u809A\u5B50\u7A7A\u7A7A\uFF0C\u80C6\u5B50\u5927\u5927\u3002"}</div><div class="quick-reactions"><button data-react="\u4F60\u5148\u522B\u7B11\uFF0C\u6211\u5728\u8BA4\u771F\u6311\u3002">\u4F60\u5148\u522B\u7B11</button><button data-react="\u8FD9\u4E00\u76D8\uFF0C\u6211\u76EF\u4E0A\u5F88\u4E45\u4E86\u3002">\u6211\u76EF\u4E0A\u5B83\u4E86</button><button data-react="\u5148\u4E0D\u8BF4\u8F93\u8D62\uFF0C\u8BA9\u6211\u56BC\u5B8C\u8FD9\u4E00\u53E3\u3002">\u8BA9\u6211\u56BC\u5B8C</button></div><button class="text-button" id="openNotes">\u7FFB\u7FFB\u7F8E\u5473\u624B\u8D26</button></aside></div><div class="table-foot"><span>\u7B2C ${pad(state.log.length + 1)} \u53E3 \xB7 ${state.mode === "online" ? "\u623F\u95F4 " + net.roomCode : "\u8F6E\u6D41\u4EAB\u7528\uFF0C\u4E00\u9053\u4E0D\u91CD\u590D"}</span><span class="${left <= 4 ? "danger" : ""}">${left <= 4 ? "\u70DB\u706B\u6643\u4E86\u4E00\u4E0B\uFF0C\u5FC3\u8DF3\u4E5F\u8DDF\u7740\u5FEB\u4E86\u4E00\u70B9\u3002" : "\u4E00\u53E3\u7F8E\u5473\uFF0C\u4E00\u70B9\u5C0F\u5C0F\u7684\u5192\u9669\u3002"}</span></div></section>`;
  }
  function endingView(n, winner, s) {
    return `<section class="result-scene">${avatar(winner, "winner-avatar")}<span class="result-exclaim">\u53EF\u6076\uFF01\uFF01\uFF01</span><span class="script">\u8D62\u5566\uFF01\u4ECA\u665A\u7684\u5E72\u996D\u738B\u8BDE\u751F\uFF01</span><h1>${esc(n[winner])}\uFF0C\u62FF\u634F\uFF01</h1><p>${esc(n[1 - winner])}\uFF1A\u8FD9\u684C\u751C\u54C1\u8FD9\u4E48\u751C\uFF0C\u600E\u4E48\u5C31\u4F60\u4E00\u809A\u5B50\u574F\u6C34\uFF01<br>${esc(n[winner])}\uFF1A\u4E0B\u6B21\u8FD8\u5750\u6211\u5BF9\u9762\uFF1F\u6211\u7ED9\u4F60\u7559\u4F4D\u7F6E\u3002<br><span class="result-point">${esc(n[winner])} +1 \u5206</span></p><div class="result-score"><span>${s[0]}<small>${esc(n[0])}</small></span><span class="colon">:</span><span>${s[1]}<small>${esc(n[1])}</small></span></div><div class="reveal-grid">${state.r.poison.map((id2, p) => `<div class="reveal-dish"><div class="reveal-photo">${id2 === null ? "" : photo(id2)}</div><div><small>${esc(n[p])} \u85CF\u7684\u6BD2\u836F</small><h3>${id2 === null ? "\u7B49\u5BF9\u684C\u62C6\u5F00\u5C01\u6761\u2026" : state.theme.dishes[id2].name}</h3></div></div>`).join("")}</div><div class="modal-actions"><button id="again" class="btn-gold">${state.mode === "online" && net.netSlot === 1 ? "\u7B49\u623F\u4E3B\u518D\u5F00\u4E00\u5C40" : "\u4E0D\u670D\uFF01\u518D\u70AB\u4E00\u5C40"}</button><button id="changeTable" class="btn-purple">\u6536\u597D\u9910\u5177\uFF0C\u56DE\u5230\u8BF7\u67EC</button></div><div class="round-history">${state.log.map((l, i) => `<span class="history-chip ${l.hit ? "bad" : ""}">${pad(i + 1)} ${esc(n[l.player])} \xB7 ${state.theme.dishes[l.id].name}${l.hit ? " \xB7 \u9B54\u836F\u663E\u73B0" : ""}</span>`).join("")}</div>${sticker("treatbag", "result-sticker")}${sticker("goodnight", "result-sticker left")}</section>`;
  }

  // src/features/content.js
  function createContent({ ui: ui2 }) {
    const { openModal: openModal2, closeModal: closeModal2, on: on2 } = ui2;
    function chooseMenu2() {
      openModal2(
        `<span class="eyebrow">SWEET LITTLE TROUBLE</span><h2>\u8FD9\u4E00\u671F\uFF1A\u5973\u5DEB\u7684\u751C\u54C1\u624B\u8D26</h2><p>\u9B54\u6CD5\u751C\u5473\u90FD\u5728\u8FD9\u91CC\uFF01\u6BCF\u5C40\u4ECE ${SWEETS.length} \u4EFD\u5B8C\u6574\u751C\u54C1\u4E2D\u968F\u673A\u4E0A 16 \u4EFD\u3002\u4ECA\u665A\u7684\u751C\u5473\uFF0C\u60F3\u5148\u5077\u5403\u54EA\u4E00\u53E3\uFF1F</p><div class="sweet-catalog">${SWEETS.map((d) => `<div><img src="${asset(d.image)}" alt="${d.name}"><b>${d.name}</b></div>`).join("")}</div><button class="btn-purple" id="menuDone">\u61C2\u4E86\uFF0C\u90FD\u662F\u6211\u7684\u68A6\u4E2D\u60C5\u70B9\uFF01</button>`,
        "feast-selector"
      );
      on2("menuDone", () => closeModal2(true));
    }
    function rules2() {
      openModal2(
        `<span class="eyebrow">BEFORE THE FIRST BITE</span><h2>\u5973\u5DEB\u7684\u8D74\u5BB4\u987B\u77E5</h2><ol><li>\u9009\u4E00\u684C\u559C\u6B22\u7684\u83DC\uFF0C\u518D\u51B3\u5B9A\u548C\u5973\u5DEB\u73A9\u3001\u53CC\u4EBA\u540C\u5C4F\uFF0C\u8FD8\u662F\u7528\u623F\u95F4\u7801\u8054\u673A\u3002</li><li>\u4E24\u4EBA\u5404\u81EA\u79D8\u5BC6\u6307\u5B9A\u4E00\u9053\u6BD2\u836F\u3002\u540C\u5C4F\u65F6\u8F6E\u6D41\u6301\u5C4F\uFF1B\u8054\u673A\u65F6\u5404\u81EA\u5728\u81EA\u5DF1\u7684\u8BBE\u5907\u4E0A\u9009\u62E9\uFF0C\u7ED3\u675F\u524D\u4E0D\u53D1\u9001\u6BD2\u836F\u4F4D\u7F6E\u3002</li><li>\u8F6E\u6D41\u70B9\u83DC\uFF0C\u6216\u957F\u6309\u4E00\u9053\u83DC\u53D6\u98DF\u3002\u6BCF\u6B21\u4ECE\u4E09\u53E5\u53E3\u5473\u611F\u53D7\u91CC\u9009\u4E00\u53E5\uFF0C\u518D\u542C\u89D2\u8272\u70B9\u8BC4\u3002\u5403\u8FC7\u7684\u83DC\u7559\u4E0B\u7A7A\u76D8\uFF0C\u4E0D\u80FD\u91CD\u590D\u9009\u3002</li><li>\u5403\u5230\u4EFB\u610F\u4E00\u65B9\u8BBE\u4E0B\u7684\u6BD2\u836F\u5C31\u79BB\u5E2D\uFF0C\u53E6\u4E00\u4F4D\u79EF 1 \u5206\u3002\u8BB0\u4F4F\u81EA\u5DF1\u7684\u6BD2\u836F\uFF0C\u53EF\u4EE5\u907F\u5F00\u5B83\u3002\u4E24\u4EBA\u53EF\u4EE5\u9009\u540C\u4E00\u9053\u3002</li><li>\u7ED3\u675F\u540E\u63ED\u6653\u53CC\u65B9\u6BD2\u836F\uFF0C\u4E0B\u4E00\u5C40\u8F6E\u6362\u5148\u624B\u3002\u79EF\u5206\u4E0E\u624B\u8D26\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u3002</li></ol><p>\u4EBA\u673A\u5973\u5DEB\u5F00\u5C40\u968F\u673A\u9009\u6BD2\uFF0C\u4E4B\u540E\u4E0D\u4F1A\u66F4\u6539\uFF1B\u5979\u6311\u83DC\u65F6\u4E0D\u4F1A\u8BFB\u53D6\u4F60\u7684\u6BD2\u836F\u3002\u8054\u673A\u77ED\u6682\u5207\u5C4F\u6216\u7F51\u7EDC\u6CE2\u52A8\u540E\uFF0C\u4F1A\u5C1D\u8BD5\u5728 90 \u79D2\u5185\u63A5\u56DE\u539F\u56DE\u5408\u3002\u8BF7\u4FDD\u7559\u7F51\u9875\uFF1B\u5237\u65B0\u6216\u5173\u95ED\u65E0\u6CD5\u6062\u590D\u623F\u95F4\u3002\u8054\u673A\u79EF\u5206\u5C55\u793A\u672C\u6B21\u9910\u684C\u7684\u6218\u7EE9\uFF0C\u79EF\u5206\u7C3F\u53E6\u8BB0\u6D4F\u89C8\u5668\u7D2F\u8BA1\u6210\u7EE9\u3002</p>`
      );
    }
    function journal2() {
      openModal2(
        `<span class="eyebrow">THE LITTLE TASTING JOURNAL</span><h2>\u628A\u597D\u5403\u7684\uFF0C\u90FD\u8BB0\u4E0B\u6765</h2>${state.db.notes.length ? '<div class="journal-list">' + state.db.notes.map((l) => {
          const t = MENU.find((t2) => t2.id === l.theme);
          if (!t) return "";
          const journalPhoto = l.image ? `<img class="food-photo" src="${asset(l.image)}" alt="${esc(l.dishName)}">` : photo(l.id, t);
          return `<article class="journal-entry"><div class="entry-photo">${journalPhoto}</div><div><small>${esc(l.name)} \xB7 ${t.name}${l.hit ? " \xB7 \u9B54\u836F\u663E\u73B0" : ""}</small><h3>\u201C${esc(l.label)}\u3002\u201D</h3><p>${esc(l.text)}</p></div></article>`;
        }).join("") + "</div>" : `<div class="empty-state">${sticker("letter")}\u8FD9\u672C\u624B\u8D26\u8FD8\u5F88\u5E72\u51C0\u3002<br>\u7B49\u4F60\u5403\u8FC7\u7B2C\u4E00\u53E3\uFF0C\u518D\u6765\u5199\u4E0A\u9999\u6C14\u3002</div>`}`
      );
    }
    function scores2() {
      openModal2(
        `<span class="eyebrow">THE LITTLE VICTORY BOOK</span><h2>\u4ECA\u665A\uFF0C\u8C01\u591A\u5403\u4E86\u4E00\u53E3\uFF1F</h2><table class="score-table"><thead><tr><th>\u73A9\u6CD5</th><th>\u7B2C\u4E00\u4F4D</th><th>\u7B2C\u4E8C\u4F4D</th><th>\u5DF2\u5B8C\u6210</th></tr></thead><tbody>${[
          ["solo", "\u548C\u5973\u5DEB\u73A9"],
          ["local", "\u53CC\u4EBA\u540C\u5C4F"],
          ["online", "\u53CC\u4EBA\u8054\u673A"]
        ].map(
          ([m, s]) => `<tr><td>${s}</td><td>${state.db.scores[m][0]}</td><td>${state.db.scores[m][1]}</td><td>${state.db.rounds[m]}</td></tr>`
        ).join("")}</tbody></table><p>\u6BCF\u80DC\u4E00\u5C40\u79EF 1 \u5206\uFF0C\u4E24\u79CD\u5934\u50CF\u6309\u5E2D\u4F4D\u5BF9\u5E94\u3002</p>`
      );
    }
    function credits2() {
      openModal2(
        `<div class="credits"><h2>\u7D20\u6750\u4E0E\u9E23\u8C22</h2><p>\u672C\u9879\u76EE\u6240\u51FA\u73B0\u7684\u6240\u6709\u751C\u54C1\u5747\u4E3A AI \u521B\u4F5C\u3002</p><p>\u89D2\u8272\u5934\u50CF\u4E3A\u5C0F\u7EA2\u4E66\u535A\u4E3B\u91CE\u8393\u751C\u5FC3\u8001\u5E08\u7684 AI \u521B\u4F5C\u3002</p><p>\u80CC\u666F\u97F3\u4E50\u300A\u5357\u74DC\u7CD6\u679C\u5706\u821E\u66F2\u300B\u300A\u6708\u4EAE\u8EB2\u732B\u732B\u300B\u4E3A\u672C\u6E38\u620F\u7F16\u5199\u7684\u539F\u521B\u65CB\u5F8B\u3002</p><p>\u5F00\u5C4F\u7FFB\u724C\u7684\u8BBE\u8BA1\u53C2\u8003 47\u3001nival \u4E0E baink \u7684 <a href="https://github.com/knacl47/between-us" target="_blank" rel="noopener">BETWEEN US</a> \u5F00\u6E90\u9879\u76EE\uFF08MIT \u4EE3\u7801\u8BB8\u53EF\uFF09\uFF0C\u672C\u7248\u4F7F\u7528\u91CD\u65B0\u5236\u4F5C\u7684\u53CC\u4EBA\u7FFB\u724C\u5F00\u5C4F\u3002\u5361\u724C\u4E0E\u8759\u8760\u52A8\u6548\u4E3A\u672C\u6E38\u620F\u5236\u4F5C\uFF0C\u52A8\u4F5C\u8282\u594F\u53C2\u8003 <a href="https://github.com/qimingjiu/Trianon" target="_blank" rel="noopener">qimingjiu/Trianon</a>\u3002</p><p>\u4E2D\u6587\u4F7F\u7528\u7AD9\u9177\u5FEB\u4E50\u4F53\uFF0C\u82F1\u6587\u4F7F\u7528 Pacifico\uFF08\u5747\u4E3A SIL OFL \u5B57\u4F53\u8BB8\u53EF\uFF09\u3002\u8054\u673A\u4F7F\u7528 PeerJS\u3002</p><p>\u539F\u521B\u4EE3\u7801\u7684\u5F00\u6E90\u8BB8\u53EF\u5F85\u9879\u76EE\u53D1\u8D77\u8005\u786E\u8BA4\uFF1B\u5B57\u4F53\u4E0E\u7B2C\u4E09\u65B9\u5E93\u4FDD\u7559\u5404\u81EA\u8BB8\u53EF\u3002\u89D2\u8272\u5934\u50CF\u4EC5\u4EAB\u6709\u672C\u6E38\u620F\u4F7F\u7528\u6743\uFF0C\u4E0D\u968F\u6E90\u7801\u5F00\u653E\u989D\u5916\u6388\u6743\u3002\u8BE6\u7EC6\u6765\u6E90\u89C1\u9879\u76EE ASSETS.md\u3002</p></div>`
      );
    }
    return { chooseMenu: chooseMenu2, rules: rules2, journal: journal2, scores: scores2, credits: credits2 };
  }

  // src/core/lifetime.js
  function createLifetime() {
    const controller = new AbortController();
    const timers = /* @__PURE__ */ new Set();
    return {
      get signal() {
        return controller.signal;
      },
      listen(target, type, callback, options = {}) {
        target.addEventListener(type, callback, {
          ...options,
          signal: controller.signal
        });
      },
      delay(callback, ms) {
        const id2 = setTimeout(() => {
          timers.delete(id2);
          if (!controller.signal.aborted) callback();
        }, ms);
        timers.add(id2);
        return id2;
      },
      cancel(id2) {
        clearTimeout(id2);
        timers.delete(id2);
      },
      destroy() {
        controller.abort();
        for (const id2 of timers) clearTimeout(id2);
        timers.clear();
      }
    };
  }

  // src/ui/dialogs.js
  function createUI() {
    const lifetime2 = createLifetime(), app2 = $("app"), modal2 = $("modal");
    let focusBefore = null, toastTimer = null;
    function toast2(text2) {
      lifetime2.cancel(toastTimer);
      $("snackbar").textContent = text2;
      $("snackbar").classList.add("visible");
      toastTimer = lifetime2.delay(
        () => $("snackbar").classList.remove("visible"),
        3500
      );
    }
    function on2(id2, fn) {
      const node = $(id2);
      if (node) node.addEventListener("click", fn);
    }
    function closeModal2(force = false) {
      if (!force && modal2.dataset.lock === "1") return;
      modal2.hidden = true;
      modal2.innerHTML = "";
      document.body.style.overflow = "";
      if (focusBefore?.isConnected) focusBefore.focus({ preventScroll: true });
    }
    function openModal2(html, cls = "", lock = false) {
      if (modal2.hidden) focusBefore = document.activeElement;
      modal2.hidden = false;
      modal2.dataset.lock = lock ? "1" : "0";
      modal2.innerHTML = `<section role="dialog" aria-modal="true" aria-label="${lock ? "\u54C1\u5C1D\u7F8E\u98DF" : "\u5973\u5DEB\u665A\u5BB4\u4FBF\u7B3A"}" class="modal-card ${cls}">${lock ? "" : '<button class="close-modal" aria-label="\u5173\u95ED">\xD7</button>'}${html}</section>`;
      document.body.style.overflow = "hidden";
      modal2.querySelector(".close-modal")?.addEventListener("click", () => closeModal2(), { once: true });
      requestAnimationFrame(
        () => modal2.querySelector("button,input")?.focus({ preventScroll: true })
      );
    }
    lifetime2.listen(modal2, "click", (e) => {
      if (e.target === modal2) closeModal2();
    });
    lifetime2.listen(document, "keydown", (e) => {
      if (modal2.hidden) return;
      if (e.key === "Escape") closeModal2();
      if (e.key === "Tab") {
        const f = [
          ...modal2.querySelectorAll("button:not(:disabled),input,select,a")
        ].filter((e2) => e2.getClientRects().length);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === f.at(-1)) {
          e.preventDefault();
          f[0].focus();
        }
      }
    });
    return {
      app: app2,
      modal: modal2,
      toast: toast2,
      on: on2,
      closeModal: closeModal2,
      openModal: openModal2,
      destroy: () => lifetime2.destroy()
    };
  }

  // src/audio/sfx.js
  function createSfx() {
    let sound = true, audio = null;
    function sfx2(kind = "safe") {
      if (!sound) return;
      try {
        audio = audio || new AudioContext();
        audio.resume();
        if (kind === "bite") {
          const buf = audio.createBuffer(
            1,
            Math.floor(audio.sampleRate * 0.13),
            audio.sampleRate
          ), arr = buf.getChannelData(0);
          for (let i = 0; i < arr.length; i++)
            arr[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / arr.length, 3);
          const ns = audio.createBufferSource(), gain = audio.createGain(), filter = audio.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1900;
          gain.gain.value = 0.1;
          ns.buffer = buf;
          ns.connect(filter);
          filter.connect(gain);
          gain.connect(audio.destination);
          ns.start();
        }
        let fs = kind === "poison" ? [392, 329.63, 233.08] : kind === "victory" ? [523, 659, 784, 1047] : kind === "bite" ? [1e3, 720, 480] : [659, 880];
        fs.forEach((f, i) => {
          const o = audio.createOscillator(), g = audio.createGain(), at = audio.currentTime + i * 0.105;
          o.type = kind === "bite" ? "triangle" : "sine";
          o.frequency.value = f;
          g.gain.setValueAtTime(0, at);
          g.gain.linearRampToValueAtTime(0.04, at + 0.01);
          g.gain.exponentialRampToValueAtTime(
            1e-3,
            at + (kind === "bite" ? 0.07 : 0.43)
          );
          o.connect(g);
          g.connect(audio.destination);
          o.start(at);
          o.stop(at + 0.45);
        });
      } catch {
      }
    }
    return {
      play: sfx2,
      destroy() {
        audio?.close();
        audio = null;
      }
    };
  }

  // src/audio/music.js
  function createMusic() {
    const lifetime2 = createLifetime();
    const button = document.getElementById("soundBtn"), nextButton = document.getElementById("nextTrack"), label = document.getElementById("musicAction"), title = document.getElementById("trackName");
    const tunes = [
      [
        76,
        79,
        83,
        81,
        79,
        76,
        75,
        71,
        74,
        78,
        81,
        79,
        78,
        74,
        71,
        66,
        72,
        76,
        79,
        78,
        76,
        72,
        71,
        67,
        69,
        72,
        78,
        76,
        74,
        71,
        75,
        71,
        76,
        83,
        86,
        84,
        83,
        79,
        78,
        75,
        74,
        81,
        84,
        83,
        81,
        78,
        74,
        71,
        72,
        79,
        83,
        81,
        79,
        76,
        74,
        72,
        71,
        78,
        81,
        79,
        78,
        75,
        71,
        0
      ],
      [
        72,
        75,
        79,
        84,
        82,
        79,
        75,
        72,
        74,
        77,
        81,
        86,
        84,
        81,
        77,
        74,
        71,
        74,
        78,
        83,
        81,
        78,
        74,
        71,
        72,
        79,
        75,
        84,
        79,
        75,
        74,
        71,
        72,
        0,
        79,
        0,
        84,
        82,
        79,
        75,
        74,
        0,
        81,
        0,
        86,
        84,
        81,
        77,
        71,
        78,
        74,
        83,
        81,
        78,
        74,
        71,
        72,
        75,
        79,
        84,
        79,
        75,
        72,
        0
      ]
    ];
    const titles = ["\u5357\u74DC\u7CD6\u679C\u5706\u821E\u66F2", "\u6708\u4EAE\u8EB2\u732B\u732B"];
    let ctx, bus, timer, playing = false, wanted = false, track = 0, step = 0, next2 = 0, operation = 0;
    const voices = /* @__PURE__ */ new Set();
    try {
      track = Number(localStorage.getItem("witch-track")) === 1 ? 1 : 0;
      wanted = localStorage.getItem("witch-music") !== "off";
    } catch {
    }
    function remember() {
      try {
        localStorage.setItem("witch-music", wanted ? "on" : "off");
        localStorage.setItem("witch-track", String(track));
      } catch {
      }
    }
    function ui2() {
      button.classList.toggle("music-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute(
        "aria-label",
        playing ? "\u6682\u505C\u80CC\u666F\u97F3\u4E50" : "\u64AD\u653E\u80CC\u666F\u97F3\u4E50"
      );
      button.title = titles[track] + (playing ? " \xB7 \u70B9\u51FB\u6682\u505C" : " \xB7 \u70B9\u51FB\u64AD\u653E");
      label.textContent = playing ? "\u6682\u505C" : "\u64AD\u653E";
      title.textContent = titles[track];
      button.dataset.audioState = ctx?.state || "not-started";
      document.querySelector(".music-dock").dataset.track = String(track + 1);
    }
    function note(m, t, d, v = 0.1, type = "sine") {
      if (!m) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(1e-4, t + d);
      o.connect(g);
      g.connect(bus);
      voices.add(o);
      o.onended = () => {
        voices.delete(o);
        g.disconnect();
      };
      o.start(t);
      o.stop(t + d + 0.03);
    }
    function schedule() {
      if (!playing || ctx.state !== "running") return;
      while (next2 < ctx.currentTime + 0.3) {
        const beat = step % 6, bar = Math.floor(step / 6), root = (track ? [48, 53, 50, 55, 48, 56, 53, 55] : [52, 47, 48, 47, 52, 50, 48, 47])[Math.floor(bar / 4) % 8];
        note(
          tunes[track][Math.floor(step / (track ? 2 : 3)) % 64],
          next2,
          track ? 0.32 : 0.55,
          0.075,
          track ? "triangle" : "sine"
        );
        if (beat === 0) note(root, next2, 0.65, 0.065, "triangle");
        if (beat === 2 || beat === 4) {
          note(root + 12, next2, 0.32, 0.028);
          note(root + 15, next2, 0.32, 0.022);
          note(root + 19, next2, 0.32, 0.018);
        }
        if (step % 12 === 0) note(88 + bar % 3, next2, 1.1, 0.015);
        step++;
        next2 += track ? 0.2 : 0.23;
      }
    }
    function silence() {
      clearInterval(timer);
      for (const o of voices) {
        try {
          o.stop();
        } catch {
        }
      }
      voices.clear();
      if (bus) bus.gain.setValueAtTime(0, ctx.currentTime);
    }
    async function play() {
      const op = ++operation;
      wanted = true;
      playing = true;
      remember();
      ui2();
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (!bus) {
          bus = ctx.createGain();
          bus.connect(ctx.destination);
        }
        await ctx.resume();
        if (op !== operation || !wanted) return;
        bus.gain.setValueAtTime(0.65, ctx.currentTime);
        next2 = ctx.currentTime + 0.04;
        schedule();
        clearInterval(timer);
        timer = setInterval(schedule, 120);
        ctx.onstatechange = ui2;
        ui2();
      } catch {
        if (op === operation) {
          playing = false;
          wanted = false;
          remember();
          ui2();
          title.textContent = "\u672A\u80FD\u64AD\u653E\uFF0C\u8BF7\u518D\u70B9\u4E00\u6B21";
        }
      }
    }
    function pause(user = true) {
      operation++;
      playing = false;
      if (user) wanted = false;
      silence();
      ctx?.suspend().then(ui2).catch(() => {
      });
      remember();
      ui2();
    }
    lifetime2.listen(button, "click", () => playing ? pause() : play());
    lifetime2.listen(nextButton, "click", () => {
      operation++;
      silence();
      playing = false;
      track = (track + 1) % 2;
      step = 0;
      play();
    });
    lifetime2.listen(
      document,
      "pointerdown",
      (e) => {
        if (!e.target.closest(".music-dock") && wanted && !playing) play();
      },
      { once: true }
    );
    lifetime2.listen(document, "visibilitychange", () => {
      if (document.hidden) {
        if (playing) pause(false);
      } else if (wanted) play();
    });
    ui2();
    return {
      destroy() {
        operation++;
        wanted = false;
        playing = false;
        silence();
        lifetime2.destroy();
        ctx?.close();
      }
    };
  }

  // src/ui/motion.js
  function createMotion() {
    const lifetime2 = createLifetime(), rm = matchMedia("(prefers-reduced-motion: reduce)");
    const bat = `<svg viewBox="0 0 120 66" fill="currentColor"><path class="wing wl" d="M59 36Q31 0 2 11Q16 22 11 40Q25 28 33 48Q45 34 58 51Z"/><path class="wing wr" d="M61 36Q89 0 118 11Q104 22 109 40Q95 28 87 48Q75 34 62 51Z"/><path d="M51 19L52 3L60 14L68 3L69 19Q82 43 66 57L60 65L54 57Q38 43 51 19"/><circle cx="56" cy="27" r="2" fill="#ffdc93"/><circle cx="65" cy="27" r="2" fill="#ffdc93"/></svg>`;
    let openingLifetime = null, transitionLifetime = null, lastStage = null;
    function pop(el, text2) {
      if (!el) return;
      if (!rm.matches)
        el.animate(
          [
            { transform: "scale(.9) rotate(-3deg)" },
            { transform: "scale(1.07) rotate(2deg)", offset: 0.6 },
            { transform: "scale(1)" }
          ],
          { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)" }
        );
      if (text2) {
        const t = document.createElement("span");
        t.className = "comic-pop";
        t.textContent = text2;
        el.append(t);
        lifetime2.delay(() => t.remove(), 1e3);
      }
    }
    function flock() {
      if (rm.matches || document.hidden || document.querySelector(".privacy-notice"))
        return;
      for (let i = 0; i < 4; i++) {
        const b = document.createElement("div");
        b.className = "flying-bat";
        b.innerHTML = bat;
        b.style.cssText = `--flight-y:${20 + i * 15}vh;--flight-delay:${i * 0.18}s;--bat-size:${36 + i % 3 * 15}px;--flight-tilt:${i % 2 ? 8 : -8}deg`;
        document.body.append(b);
        lifetime2.delay(() => b.remove(), 4300);
      }
    }
    function bite() {
      const p = document.querySelector(".hero-plate");
      p?.classList.add("chewing");
      pop(p, "\u554A\u2014\u2014\u545C\uFF01");
      if (!rm.matches)
        p?.animate(
          [
            { transform: "rotate(-5deg) scale(1)" },
            { transform: "rotate(5deg) scale(.9)", offset: 0.35 },
            { transform: "rotate(-2deg) scale(1.04)", offset: 0.7 },
            { transform: "none" }
          ],
          { duration: 430 }
        );
    }
    function verdict(hit) {
      const c = document.querySelector(".taste-card");
      pop(document.querySelector(".speech-bubble"));
      document.querySelector(".hero-plate")?.classList.remove("chewing");
      c?.classList.add(hit ? "comic-disaster" : "comic-yummy");
      if (hit) flock();
    }
    function clearOpening() {
      openingLifetime?.destroy();
      openingLifetime = null;
      document.querySelector("#openingFrame")?.remove();
    }
    function opening() {
      clearOpening();
      document.body.classList.remove("opening-revealed");
      if (rm.matches) {
        document.documentElement.classList.remove("opening-boot");
        return;
      }
      document.documentElement.classList.add("opening-boot");
      const own = openingLifetime = createLifetime(), f = document.createElement("iframe");
      f.id = "openingFrame";
      f.title = "\u5973\u5DEB\u7684\u7D2B\u8272\u9B54\u6CD5\u5F00\u573A";
      const underlay = document.querySelector("#app");
      let progress = 0, animationFrame = 0, exiting = false;
      const apply = (p) => {
        progress = p;
        f.style.transform = `translate3d(0,${-p * innerHeight * 0.72}px,0)`;
        f.style.opacity = String(1 - p);
        if (underlay) {
          underlay.style.transform = `translate3d(0,${(1 - p) * Math.min(80, innerHeight * 0.1)}px,0)`;
          underlay.style.opacity = String(0.45 + p * 0.55);
        }
      };
      const restore = () => {
        if (underlay) {
          underlay.style.removeProperty("transform");
          underlay.style.removeProperty("opacity");
        }
      };
      window.scrollTo({ top: 0, behavior: "instant" });
      const finish = () => {
        if (openingLifetime !== own) return;
        document.documentElement.classList.remove("opening-boot");
        restore();
        clearOpening();
      };
      const loader = document.querySelector("#bootLoader"), count = document.querySelector("#bootCount");
      loader?.style.setProperty("--load", "0");
      if (count) count.textContent = "0 / 4";
      let ready = false;
      const continueButton = document.querySelector("#bootContinue"), loadingMessage = document.querySelector("#bootMessage");
      if (continueButton) continueButton.hidden = true;
      if (loadingMessage) loadingMessage.textContent = "\u6B63\u5728\u70B9\u4EAE\u79D8\u5BC6\u665A\u9910";
      const watchdog = own.delay(() => {
        if (loadingMessage) loadingMessage.textContent = "\u5F00\u573A\u52A0\u8F7D\u8F83\u6162\uFF0C\u53EF\u4EE5\u5148\u8FDB\u5165\u665A\u5BB4";
        if (continueButton) continueButton.hidden = false;
      }, 15e3);
      if (continueButton) own.listen(continueButton, "click", finish);
      own.listen(f, "load", () => {
        f.contentWindow?.postMessage(
          { type: "between:opening-ping" },
          location.origin === "null" ? "*" : location.origin
        );
      });
      const settle = (target, complete = false) => {
        cancelAnimationFrame(animationFrame);
        const from = progress, start2 = performance.now(), duration = complete ? 760 - from * 180 : 300;
        const tick = (now) => {
          if (openingLifetime !== own) return;
          const t = Math.min(1, (now - start2) / duration), ease = 1 - Math.pow(1 - t, 3);
          apply(from + (target - from) * ease);
          if (t < 1) animationFrame = requestAnimationFrame(tick);
          else if (complete) finish();
        };
        animationFrame = requestAnimationFrame(tick);
      };
      own.listen(window, "message", (e) => {
        if (e.source !== f.contentWindow || e.origin !== location.origin || openingLifetime !== own)
          return;
        const d = e.data;
        if (d?.type === "between:opening-loading" && Number.isInteger(d.done) && d.done >= 0 && d.done <= 4) {
          loader?.style.setProperty("--load", String(d.done / 4));
          if (count) count.textContent = `${d.done} / 4`;
        }
        if (d?.type === "between:opening-ready" && !ready) {
          ready = true;
          own.cancel(watchdog);
          own.delay(
            () => document.documentElement.classList.remove("opening-boot"),
            320
          );
        }
        if (d?.type === "between:opening-progress" && !exiting && Number.isFinite(d.progress)) {
          cancelAnimationFrame(animationFrame);
          apply(Math.max(0, Math.min(0.9, d.progress)));
        }
        if (d?.type === "between:opening-cancel" && !exiting) settle(0);
        if (d?.type === "between:opening-exit" && !exiting) {
          exiting = true;
          document.documentElement.classList.remove("opening-boot");
          settle(1, true);
        }
        if (d?.type === "between:opening-error") finish();
      });
      own.signal.addEventListener(
        "abort",
        () => {
          cancelAnimationFrame(animationFrame);
          restore();
        },
        { once: true }
      );
      if (window.SUPPER_OPENING_HTML)
        f.srcdoc = window.SUPPER_OPENING_HTML.replace(
          /\.\.\/(assets\/[^\s"'()<>]+)/g,
          (_, path) => asset(path)
        );
      else f.src = "opening/index.html?v=1.0.0";
      document.body.append(f);
    }
    function cancelTransition() {
      transitionLifetime?.destroy();
      transitionLifetime = null;
      document.body.classList.remove("new-transition");
      document.querySelector("#sceneTransition").replaceChildren();
    }
    function transition2(text2, fn) {
      cancelTransition();
      const own = transitionLifetime = createLifetime(), el = document.querySelector("#sceneTransition");
      el.innerHTML = '<div class="magic-wipe"><div class="orbit">\u2726<i>\u2727</i></div><div class="turning-seal">\u263E</div><b></b></div>';
      el.querySelector("b").textContent = text2;
      document.body.classList.add("new-transition");
      own.delay(fn, rm.matches ? 0 : 340);
      own.delay(cancelTransition, rm.matches ? 20 : 800);
    }
    const observer = new MutationObserver((ms) => {
      for (const m of ms)
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1 || !n.matches(".stage") || rm.matches) continue;
          const phase = document.body.dataset.phase;
          if (phase === lastStage) continue;
          lastStage = phase;
          n.querySelectorAll(".dish").forEach(
            (d, i) => d.animate(
              [
                { opacity: 0, transform: "translateY(17px) scale(.94)" },
                { opacity: 1, transform: "none" }
              ],
              {
                duration: 380,
                delay: i * 18,
                easing: "cubic-bezier(.2,.85,.3,1)",
                fill: "backwards"
              }
            )
          );
        }
    });
    observer.observe(document.querySelector("#app"), { childList: true });
    const replay = document.createElement("button");
    replay.className = "replay-magic";
    replay.textContent = "\u2726 \u91CD\u64AD\u5C0F\u9B54\u6CD5";
    lifetime2.listen(replay, "click", opening);
    document.querySelector("footer").prepend(replay);
    lifetime2.listen(document, "pointermove", (e) => {
      if (e.pointerType === "touch" || rm.matches) return;
      const c = e.target.closest(".witch-card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty(
        "--rx",
        ((e.clientY - r.top) / r.height - 0.5) * -8 + "deg"
      );
      c.style.setProperty(
        "--ry",
        ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg"
      );
    });
    lifetime2.listen(document, "pointerout", (e) => {
      const c = e.target.closest(".witch-card");
      if (c && !c.contains(e.relatedTarget)) {
        c.style.removeProperty("--rx");
        c.style.removeProperty("--ry");
      }
    });
    lifetime2.listen(
      document,
      "visibilitychange",
      () => document.body.classList.toggle("motion-paused", document.hidden)
    );
    const scenery = document.createElement("div");
    scenery.className = "banquet-scenery";
    scenery.setAttribute("aria-hidden", "true");
    const stickers = [
      ["cat", "cat-large"],
      ["ghost-lantern", "ghost-small"],
      ["lantern", "lantern-large"],
      ["cauldron", "cauldron-mid"],
      ["potion", "potion-small"]
    ];
    scenery.innerHTML = '<div class="bg-paper paper-one"></div><div class="bg-paper paper-two"></div><div class="bg-paper paper-three"></div><div class="bg-ticket ticket-one"></div><div class="bg-ticket ticket-two"></div>' + stickers.map(([file, cls], i) => {
      const src = asset("assets/journal-v5/" + file + ".png");
      return `<div class="bg-sticker ${cls}" style="--cutout:url('${src}');--lag:${-i * 1.37}s"><img src="${src}" alt=""></div>`;
    }).join("") + '<i class="bg-star star-one">\u2726</i><i class="bg-star star-two">\u2727</i><i class="bg-star star-three">\u2726</i><i class="bg-star star-four">\u2727</i>';
    document.body.append(scenery);
    opening();
    return {
      pop,
      flock,
      bite,
      verdict,
      opening,
      transition: transition2,
      cancelTransition,
      destroy() {
        clearOpening();
        cancelTransition();
        observer.disconnect();
        lifetime2.destroy();
        replay.remove();
        scenery.remove();
        document.querySelectorAll(".flying-bat,.comic-pop,.taste-particle").forEach((n) => n.remove());
      }
    };
  }

  // src/features/saves.js
  function createSaves({ ui: ui2, actions }) {
    const { openModal: openModal2, closeModal: closeModal2, toast: toast2, on: on2, modal: modal2 } = ui2;
    const {
      home: home2,
      board: board2,
      ending: ending2,
      showFeedback: showFeedback2,
      botTurn: botTurn2,
      save: save2,
      resetNet: resetNet2,
      autoSave: autoSave2
    } = actions;
    function restoreSnap(v) {
      if (!validSnap(v)) {
        toast2("\u8FD9\u4EFD\u5B58\u6863\u683C\u5F0F\u4E0D\u5BF9\uFF0C\u6CA1\u6709\u8986\u76D6\u73B0\u6709\u8FDB\u5EA6\u3002");
        return;
      }
      state.epoch++;
      resetNet2();
      closeModal2(true);
      state.mode = v.mode;
      v = JSON.parse(JSON.stringify(v));
      state.db = v.db;
      state.theme = {
        ...MENU[0],
        dishes: v.themeKeys.map((k, id2) => ({
          ...SWEETS.find((d) => d.key === k),
          id: id2
        }))
      };
      state.r = v.r;
      state.log = v.log;
      state.scored = !!v.scored;
      state.secrets = [null, null];
      state.taste = null;
      save2();
      if (!state.r) {
        home2();
        return;
      }
      if (state.r.over) {
        ending2();
        return;
      }
      board2();
      const t = v.taste;
      if (t?.resolved && state.log.length) {
        const l = state.log.at(-1);
        state.taste = {
          id: l.id,
          player: l.player,
          resolved: true,
          bot: false
        };
        showFeedback2(l.id, l.k, l.player, l.hit, true);
      } else if (state.mode === "solo" && state.r.turn === 1) botTurn2();
      autoSave2();
      toast2("\u5B58\u6863\u8BFB\u597D\u5566\u3002");
    }
    function saveManager() {
      if (state.mode === "online") {
        toast2("\u8054\u673A\u8FDB\u5EA6\u7531\u53CC\u65B9\u5171\u540C\u8FDB\u884C\uFF0C\u6682\u4E0D\u652F\u6301\u672C\u5730\u8BFB\u6863\u3002");
        return;
      }
      const slots = readSlots();
      const automatic = readAuto();
      openModal2(
        `<h2>\u5B58\u6863\u5C0F\u62BD\u5C49</h2><p>\u79EF\u5206\u3001\u624B\u8D26\u548C\u5DF2\u5F00\u5BB4\u7684\u5BF9\u5C40\u90FD\u53EF\u4EE5\u4FDD\u5B58\u3002\u4E09\u4E2A\u5B58\u6863\u4F4D\u53EF\u5206\u522B\u4FDD\u7559\u4E0D\u540C\u8FDB\u5EA6\u3002</p><div class="save-menu">${slots.map((s, i) => `<article class="save-slot"><h3>\u5B58\u6863 ${i + 1}</h3><p>${s ? new Date(s.at).toLocaleString("zh-CN") + " \xB7 " + (s.mode === "solo" ? "\u548C\u5C0F\u6708\u4EAE\u73A9" : "\u53CC\u4EBA\u540C\u5C4F") + " \xB7 " + (s.r ? "\u5DF2\u5403 " + s.log.length + " \u53E3" : "\u9996\u9875") : "\u8FD8\u7A7A\u7740\uFF0C\u7B49\u4E00\u4EFD\u5C0F\u79D8\u5BC6\u3002"}</p><div class="slot-actions"><button data-save="${i}">${s ? "\u8986\u76D6\u6B64\u6863" : "\u5B58\u5165\u6B64\u6863"}</button><button data-load="${i}" ${s ? "" : "disabled"}>\u8BFB\u6863</button></div></article>`).join("")}</div><div class="save-toolbar"><button class="btn-purple" id="loadAuto" ${automatic ? "" : "disabled"}>\u8BFB\u53D6\u81EA\u52A8\u5B58\u6863</button><button class="btn-purple" id="exportSaves">\u5BFC\u51FA\u5907\u4EFD</button><button class="btn-purple" id="importSaves">\u5BFC\u5165\u5907\u4EFD</button><button class="btn-gold" id="freshRound">\u91CD\u7F6E\u5F53\u524D\u5C40</button></div><input id="saveFile" class="import-save" type="file" accept="application/json,.json"><p class="save-message">\u5237\u65B0\u540E\u53EF\u8BFB\u53D6\u81EA\u52A8\u5B58\u6863\u3002\u91CD\u7F6E\u5F53\u524D\u5C40\u4F1A\u4FDD\u7559\u79EF\u5206\u3001\u624B\u8D26\u548C\u624B\u52A8\u5B58\u6863\u3002</p>`
      );
      modal2.querySelectorAll("[data-save]").forEach(
        (b) => b.onclick = () => {
          const i = +b.dataset.save, v = snapshot(state);
          if (!v) return;
          if (slots[i]) {
            openModal2(
              `<h2>\u8986\u76D6\u5B58\u6863 ${i + 1} \u5417\uFF1F</h2><p>\u539F\u6765\u8FD9\u4E2A\u4F4D\u7F6E\u7684\u8FDB\u5EA6\u5C06\u88AB\u5F53\u524D\u8FDB\u5EA6\u66FF\u6362\uFF0C\u5176\u4ED6\u5B58\u6863\u4E0D\u53D8\u3002</p><button class="btn-purple" id="overwrite">\u786E\u8BA4\u8986\u76D6</button>`
            );
            on2("overwrite", () => {
              slots[i] = v;
              if (!writeSlots(slots)) {
                toast2("\u6CA1\u6709\u4FDD\u5B58\u6210\u529F\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u6216\u5BFC\u51FA\u5907\u4EFD\u3002");
                return;
              }
              saveManager();
              toast2("\u8986\u76D6\u4FDD\u5B58\u597D\u4E86\u3002");
            });
          } else {
            slots[i] = v;
            if (!writeSlots(slots)) {
              toast2("\u6CA1\u6709\u4FDD\u5B58\u6210\u529F\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u6216\u5BFC\u51FA\u5907\u4EFD\u3002");
              return;
            }
            saveManager();
            toast2("\u5B58\u597D\u5566\u3002");
          }
        }
      );
      modal2.querySelectorAll("[data-load]").forEach(
        (b) => b.onclick = () => confirmRestore(slots[+b.dataset.load])
      );
      on2("loadAuto", () => confirmRestore(automatic));
      on2("freshRound", () => {
        openModal2(
          '<h2>\u91CD\u65B0\u5F00\u4E00\u684C\uFF1F</h2><p>\u5F53\u524D\u672A\u7ED3\u675F\u7684\u5BF9\u5C40\u4E0D\u8BA1\u5206\uFF0C\u5DF2\u6709\u79EF\u5206\u3001\u624B\u8D26\u548C\u5B58\u6863\u4FDD\u7559\u3002</p><button class="btn-purple" id="resetRound">\u786E\u8BA4\u91CD\u65B0\u5F00\u59CB</button>'
        );
        on2("resetRound", () => {
          state.epoch++;
          state.r = null;
          state.taste = null;
          removeAuto();
          home2();
        });
      });
      on2("exportSaves", () => {
        const v = exportBackup(state);
        const u = URL.createObjectURL(
          new Blob([JSON.stringify(v, null, 2)], {
            type: "application/json"
          })
        ), a = document.createElement("a");
        a.href = u;
        a.download = "witch-supper-backup.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 2e3);
      });
      on2("importSaves", () => $("saveFile").click());
      $("saveFile").onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 25e5) {
          toast2("\u5907\u4EFD\u6587\u4EF6\u592A\u5927\u4E86\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u9009\u5BF9\u3002");
          return;
        }
        try {
          const v = parseBackup(await f.text());
          openModal2(
            '<h2>\u5BFC\u5165\u5E76\u66FF\u6362\u5B58\u6863\u62BD\u5C49\uFF1F</h2><p>\u4E09\u4E2A\u624B\u52A8\u5B58\u6863\u5C06\u66FF\u6362\u4E3A\u6587\u4EF6\u4E2D\u7684\u5185\u5BB9\u3002\u5F53\u524D\u5BF9\u5C40\u548C\u79EF\u5206\u6682\u4E0D\u6539\u53D8\uFF0C\u8BFB\u6863\u540E\u624D\u4F1A\u6062\u590D\u3002</p><button class="btn-purple" id="confirmImport">\u786E\u8BA4\u5BFC\u5165</button>'
          );
          on2("confirmImport", () => {
            if (!importBackup(v)) {
              toast2("\u5BFC\u5165\u6CA1\u6709\u5B8C\u6210\uFF0C\u539F\u5B58\u6863\u5DF2\u4FDD\u7559\u3002");
              return;
            }
            saveManager();
            toast2("\u5907\u4EFD\u5BFC\u5165\u597D\u4E86\u3002");
          });
        } catch {
          toast2("\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684\u6E38\u620F\u5907\u4EFD\uFF0C\u73B0\u6709\u6570\u636E\u6CA1\u6709\u6539\u52A8\u3002");
        }
      };
    }
    function confirmRestore(v) {
      if (!validSnap(v)) {
        toast2("\u8FD9\u4EFD\u5B58\u6863\u65E0\u6CD5\u8BFB\u53D6\u3002");
        return;
      }
      openModal2(
        '<h2>\u56DE\u5230\u8FD9\u4EFD\u5B58\u6863\uFF1F</h2><p>\u5F53\u524D\u5BF9\u5C40\u3001\u79EF\u5206\u548C\u624B\u8D26\u4F1A\u6062\u590D\u5230\u5B58\u6863\u65F6\u7684\u72B6\u6001\u3002</p><button class="btn-purple" id="confirmRead">\u786E\u8BA4\u8BFB\u6863</button>'
      );
      on2("confirmRead", () => restoreSnap(v));
    }
    return { saveManager, restoreSnap };
  }

  // src/core/protocol.js
  var id = (n) => Number.isInteger(n) && n >= 0 && n < 16;
  function validTaste(d, expected) {
    return d && id(d.id) && Number.isInteger(d.k) && d.k >= 0 && d.k < 3 && d.no === expected && typeof d.ownHit === "boolean";
  }
  function validVerdict(d, expected) {
    return d && id(d.id) && Number.isInteger(d.k) && d.k >= 0 && d.k < 3 && d.no === expected && typeof d.hit === "boolean";
  }
  function validStart(d, keys) {
    return d && [0, 1].includes(d.first) && Number.isSafeInteger(d.sequence) && d.sequence > 0 && Array.isArray(d.names) && d.names.length === 2 && d.names.every((n) => typeof n === "string" && n.length <= 30) && Array.isArray(d.dishKeys) && d.dishKeys.length === 16 && new Set(d.dishKeys).size === 16 && d.dishKeys.every((k) => keys.has(k));
  }
  async function commitment(room, round, secret, salt) {
    const bytes = new TextEncoder().encode(`${room}:${round}:${secret}:${salt}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(
      new Uint8Array(digest),
      (b) => b.toString(16).padStart(2, "0")
    ).join("");
  }
  function validFinishedRound(log, poisons, winner) {
    if (!Array.isArray(log) || !log.length || poisons.length !== 2 || !poisons.every(id))
      return false;
    const eaten = /* @__PURE__ */ new Set();
    for (let i = 0; i < log.length; i++) {
      const l = log[i];
      if (!id(l.id) || ![0, 1].includes(l.player) || eaten.has(l.id) || i && l.player === log[i - 1].player || l.hit !== poisons.includes(l.id) || l.hit !== (i === log.length - 1))
        return false;
      eaten.add(l.id);
    }
    return winner === 1 - log.at(-1).player;
  }

  // src/core/reliable-link.js
  function createReliableLink({
    session,
    apply,
    write: write2,
    onFault = () => {
    }
  }) {
    let sent = 0, received = 0, processing = false, stopped = false;
    const outbox = /* @__PURE__ */ new Map(), inbox = /* @__PURE__ */ new Map();
    const emit = (packet) => {
      if (!stopped) write2({ ...packet, session, protocol: 3 });
    };
    async function drain() {
      if (processing || stopped) return;
      processing = true;
      try {
        while (!stopped && inbox.has(received + 1)) {
          const no = received + 1, value = inbox.get(no);
          await apply(value);
          if (stopped) break;
          inbox.delete(no);
          received = no;
          emit({ kind: "ack", ack: received });
        }
      } catch (error) {
        onFault(error);
      } finally {
        processing = false;
      }
    }
    return {
      send(value) {
        if (stopped || outbox.size >= 128) return false;
        const packet = { kind: "event", seq: ++sent, value };
        outbox.set(sent, packet);
        emit(packet);
        return true;
      },
      receive(packet) {
        if (stopped || packet?.protocol !== 3 || packet.session !== session)
          return;
        if (packet.kind === "ack") {
          if (!Number.isSafeInteger(packet.ack) || packet.ack < 0 || packet.ack > sent)
            return;
          for (const no of outbox.keys()) if (no <= packet.ack) outbox.delete(no);
        } else if (packet.kind === "event") {
          if (!Number.isSafeInteger(packet.seq) || packet.seq < 1 || packet.seq > received + 128)
            return;
          if (packet.seq <= received) emit({ kind: "ack", ack: received });
          else {
            if (!inbox.has(packet.seq)) inbox.set(packet.seq, packet.value);
            void drain();
          }
        }
      },
      replay() {
        emit({ kind: "ack", ack: received });
        for (const packet of outbox.values()) emit(packet);
      },
      get pending() {
        return outbox.size;
      },
      destroy() {
        stopped = true;
        outbox.clear();
        inbox.clear();
      }
    };
  }

  // src/features/network.js
  var RECOVERY_MS = 9e4;
  function createNetwork({
    ui: ui2,
    actions,
    game = state,
    PeerClass = globalThis.Peer
  }) {
    const state2 = game, net2 = state2.network;
    const { openModal: openModal2, closeModal: closeModal2, toast: toast2, on: on2, app: app2 } = ui2;
    const {
      home: home2,
      board: board2,
      pick: pick2,
      handoff: handoff2,
      transition: transition2,
      phaseTo: phaseTo2,
      recordTaste: recordTaste2,
      showFeedback: showFeedback2,
      doAdvance: doAdvance2,
      ending: ending2,
      reaction: reaction2,
      awardRound: awardRound2
    } = actions;
    const lifetime2 = createLifetime();
    let link = null, remotePeer = null, session = null, joinName = "", lastSeen = 0;
    let recoveryAt = 0, heartbeat = null, pendingConn = null, sealed = false;
    const candidates = /* @__PURE__ */ new Set(), candidateTimers = /* @__PURE__ */ new Set();
    function banner(message) {
      let el = $("connectionBanner");
      if (!message) {
        el?.remove();
        document.body.classList.remove("network-paused");
        return;
      }
      document.body.classList.add("network-paused");
      if (!el) {
        el = document.createElement("aside");
        el.id = "connectionBanner";
        el.setAttribute("role", "status");
        el.innerHTML = '<p></p><button id="retryConnection">\u518D\u8FDE\u4E00\u4E0B</button><button id="leaveConnection">\u56DE\u5230\u8BF7\u67EC</button>';
        document.body.append(el);
        on2("retryConnection", () => {
          recoveryAt = Date.now();
          tryReconnect();
        });
        on2("leaveConnection", home2);
      }
      el.querySelector("p").textContent = message;
    }
    function resetNet2() {
      net2.generation++;
      clearTimeout(net2.joinTimer);
      for (const timer of candidateTimers) clearTimeout(timer);
      candidateTimers.clear();
      clearInterval(heartbeat);
      heartbeat = null;
      for (const c of /* @__PURE__ */ new Set([net2.conn, pendingConn, ...candidates])) {
        try {
          c?.removeAllListeners?.();
          c?.close();
        } catch {
        }
      }
      candidates.clear();
      pendingConn = null;
      try {
        net2.peer?.removeAllListeners?.();
        net2.peer?.destroy();
      } catch {
      }
      link?.destroy();
      link = null;
      session = null;
      remotePeer = null;
      sealed = false;
      recoveryAt = 0;
      Object.assign(net2, {
        peer: null,
        conn: null,
        netConnected: false,
        netNames: null,
        onlineStarted: false,
        myCommit: null,
        theirCommit: null,
        mySecret: null,
        mySalt: null,
        netSeq: 0,
        verified: false,
        revealValid: false,
        theirReady: false,
        sessionScores: [0, 0]
      });
      banner(null);
    }
    function raw(packet, c = net2.conn) {
      try {
        if (c?.open) {
          c.send(packet);
          return true;
        }
      } catch {
      }
      return false;
    }
    function initLink() {
      const generation = net2.generation;
      link = createReliableLink({
        session,
        apply: async (d) => {
          if (generation === net2.generation) await handleNetwork(d);
        },
        write: (packet) => raw(packet),
        onFault: () => pause("\u540C\u6B65\u6682\u65F6\u505C\u4F4F\u4E86\uFF0C\u6B63\u5728\u5C1D\u8BD5\u63A5\u56DE\u9910\u684C\u3002")
      });
    }
    function send2(value) {
      return link?.send({ ...value, round: net2.netSeq }) || false;
    }
    function networkMenu2() {
      openModal2(
        `<span class="eyebrow">AN EMPTY CHAIR IS WAITING</span><h2>\u7ED9\u5BF9\u684C\u70B9\u4E00\u76CF\u706F</h2><p>\u628A\u516D\u7801\u53E3\u4EE4\u4EA4\u7ED9\u670B\u53CB\uFF0C\u5404\u81EA\u5728\u81EA\u5DF1\u7684\u8BBE\u5907\u4E0A\u85CF\u597D\u79D8\u5BC6\u3002\u77ED\u6682\u5207\u5C4F\u6216\u7F51\u7EDC\u6CE2\u52A8\u540E\uFF0C\u4F1A\u5C1D\u8BD5\u5728 90 \u79D2\u5185\u63A5\u56DE\u539F\u56DE\u5408\uFF1B\u8BF7\u4FDD\u7559\u7F51\u9875\uFF0C\u5237\u65B0\u65E0\u6CD5\u6062\u590D\u623F\u95F4\u3002</p><div class="network-form"><label>\u4F60\u5728\u4ECA\u665A\u7684\u540D\u5B57<input id="onlineName" maxlength="12" value="${esc(state2.db.names[0])}" aria-label="\u8054\u673A\u540D\u5B57"></label><button id="createRoom" class="btn-purple">\u521B\u5EFA\u79D8\u5BC6\u9910\u684C</button><label>\u5DF2\u6709\u53E3\u4EE4<input id="roomInput" maxlength="6" placeholder="\u8F93\u5165\u516D\u7801\u623F\u95F4\u53E3\u4EE4" aria-label="\u623F\u95F4\u53E3\u4EE4"></label><button id="joinRoom" class="btn-gold">\u52A0\u5165\u5BF9\u684C\u7684\u665A\u9910</button><p class="network-error" id="networkError"></p></div>`
      );
      on2("createRoom", () => connectRoom(true));
      on2("joinRoom", () => connectRoom(false));
    }
    function connectionError(message) {
      clearTimeout(net2.joinTimer);
      if ($("networkError")) $("networkError").textContent = message;
      if ($("roomStatus")) $("roomStatus").textContent = message;
      toast2(message);
    }
    function connectRoom(host) {
      const code = host ? Array.from(
        { length: 6 },
        () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomIndex(32)]
      ).join("") : $("roomInput").value.trim().toUpperCase();
      joinRoom({ host, code, name: $("onlineName").value.trim() || "\u5C0F\u5973\u5DEB" });
    }
    function joinRoom({ host, code, name }) {
      if (typeof PeerClass !== "function")
        return connectionError("\u8FDE\u63A5\u5E93\u6CA1\u6709\u52A0\u8F7D\u6210\u529F\uFF0C\u8BF7\u8054\u7F51\u540E\u91CD\u65B0\u6253\u5F00\u9875\u9762\u3002");
      if (!/^[A-Z2-9]{6}$/.test(code))
        return connectionError("\u53E3\u4EE4\u662F\u516D\u4F4D\u5B57\u6BCD\u6216\u6570\u5B57\uFF0C\u8BF7\u518D\u770B\u4E00\u773C\u3002");
      if (!crypto.subtle)
        return connectionError("\u79D8\u5BC6\u5C01\u5B58\u9700\u8981 HTTPS\uFF0C\u8BF7\u4F7F\u7528\u5728\u7EBF\u8BD5\u73A9\u5730\u5740\u3002");
      resetNet2();
      state2.mode = "online";
      net2.netSlot = host ? 0 : 1;
      net2.roomCode = code;
      joinName = name.slice(0, 12);
      net2.netNames = host ? [joinName, "\u8FD8\u6CA1\u5165\u5E2D"] : ["\u7B49\u623F\u4E3B", joinName];
      if (!host) {
        session = crypto.randomUUID();
        initLink();
      }
      if ($("networkError")) $("networkError").textContent = "\u6B63\u5728\u70B9\u4EAE\u9910\u684C\u2026";
      const generation = net2.generation;
      net2.peer = new PeerClass(host ? "witch-supper-" + code : void 0, {
        debug: 0
      });
      net2.joinTimer = setTimeout(
        () => connectionError(
          "\u6682\u65F6\u6CA1\u8FDE\u4E0A\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u548C\u53E3\u4EE4\uFF1B\u90E8\u5206\u7F51\u7EDC\u4E0D\u80FD\u76F4\u8FDE\uFF0C\u53EF\u6362\u7F51\u7EDC\u91CD\u8BD5\u3002"
        ),
        16e3
      );
      net2.peer.on("open", () => {
        if (generation !== net2.generation) return;
        if (host) {
          clearTimeout(net2.joinTimer);
          if (!session) {
            closeModal2(true);
            room();
          }
        } else dial();
      });
      if (host)
        net2.peer.on("connection", (c) => {
          if (generation === net2.generation) wire(c);
        });
      net2.peer.on("disconnected", () => {
        if (generation === net2.generation) tryReconnect();
      });
      net2.peer.on("error", (e) => {
        if (generation !== net2.generation) return;
        if (session && remotePeer) pause("\u9910\u684C\u7684\u706F\u6643\u4E86\u4E00\u4E0B\uFF0C\u6B63\u5728\u7B49\u5BF9\u684C\u56DE\u6765\u3002 ");
        else
          connectionError(
            e.type === "unavailable-id" ? "\u8FD9\u5F20\u684C\u5B50\u5DF2\u6709\u4E3B\u4EBA\uFF0C\u8BF7\u6362\u4E00\u4E2A\u623F\u95F4\u3002" : "\u6682\u65F6\u4E0D\u80FD\u8FDE\u63A5\uFF08" + e.type + "\uFF09\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\u3002"
          );
      });
      heartbeat = setInterval(() => {
        if (generation !== net2.generation || document.hidden) return;
        if (net2.netConnected) {
          if (Date.now() - lastSeen > 1e4) {
            pause();
            try {
              net2.conn?.close();
            } catch {
            }
          } else raw({ kind: "ping", session, protocol: 3 });
          link?.replay();
        }
        if (!net2.netConnected && session && remotePeer) tryReconnect();
      }, 2500);
    }
    function dial() {
      if (!net2.peer || net2.peer.destroyed || net2.peer.disconnected || pendingConn || net2.netConnected)
        return;
      pendingConn = net2.peer.connect("witch-supper-" + net2.roomCode, {
        reliable: true,
        serialization: "json"
      });
      wire(pendingConn);
    }
    function pause(message = "\u5BF9\u684C\u6682\u65F6\u6389\u7EBF\u4E86\uFF0C\u9910\u5177\u66FF\u4F60\u7559\u7740\u3002\u6B63\u5728\u63A5\u56DE\u539F\u56DE\u5408\u2026") {
      if (!session || !remotePeer) return;
      net2.netConnected = false;
      if (!recoveryAt) recoveryAt = Date.now();
      banner(message);
    }
    function tryReconnect() {
      if (!net2.peer || net2.peer.destroyed) return;
      if (recoveryAt && Date.now() - recoveryAt > RECOVERY_MS) {
        banner(
          "\u6682\u65F6\u6CA1\u80FD\u63A5\u56DE\u9910\u684C\u3002\u4FDD\u7559\u8FD9\u9875\uFF0C\u7B49\u670B\u53CB\u56DE\u6765\u540E\u70B9\u201C\u518D\u8FDE\u4E00\u4E0B\u201D\uFF0C\u6216\u56DE\u5230\u8BF7\u67EC\u91CD\u65B0\u5F00\u5C40\u3002"
        );
        return;
      }
      try {
        if (net2.peer.disconnected) net2.peer.reconnect();
        else if (net2.netSlot === 1) dial();
      } catch {
      }
    }
    function wire(c) {
      candidates.add(c);
      const generation = net2.generation;
      const valid = () => generation === net2.generation;
      let authenticated = false;
      const candidateTimer = setTimeout(() => {
        if (!authenticated) {
          if (pendingConn === c) pendingConn = null;
          c.close();
        }
      }, 8e3);
      candidateTimers.add(candidateTimer);
      const reject = () => {
        raw({ kind: "rejected", protocol: 3 }, c);
        c.close();
      };
      function activate() {
        clearTimeout(candidateTimer);
        candidateTimers.delete(candidateTimer);
        candidates.delete(c);
        const old = net2.conn;
        if (old && old !== c) {
          old.removeAllListeners?.();
          old.close();
        }
        net2.conn = c;
        pendingConn = null;
        authenticated = true;
        net2.netConnected = true;
        lastSeen = Date.now();
        recoveryAt = 0;
        clearTimeout(net2.joinTimer);
        banner(null);
        link.replay();
      }
      c.on("open", () => {
        if (!valid()) return c.close();
        if (net2.netSlot === 1)
          raw({ kind: "hello", protocol: 3, session, name: joinName }, c);
      });
      c.on("data", (d) => {
        if (!valid() || !d || typeof d !== "object") return;
        if (d.protocol !== 3) {
          connectionError("\u53CC\u65B9\u6E38\u620F\u7248\u672C\u4E0D\u540C\uFF0C\u8BF7\u66F4\u65B0\u9875\u9762\u540E\u91CD\u65B0\u8054\u673A\u3002");
          return;
        }
        if (d.kind === "hello" && net2.netSlot === 0 && !authenticated) {
          if (!/^[\da-f-]{36}$/i.test(d.session || "")) return reject();
          if (session && (d.session !== session || c.peer !== remotePeer))
            return reject();
          const first = !session;
          if (first) {
            session = d.session;
            remotePeer = c.peer;
            net2.netNames[1] = String(d.name || "\u5C0F\u6708\u4EAE").slice(0, 12);
            initLink();
          }
          raw({ kind: "welcome", protocol: 3, session }, c);
          activate();
          if (first) {
            send2({ type: "welcome", names: net2.netNames });
            room();
          }
          return;
        }
        if (d.kind === "welcome" && net2.netSlot === 1 && d.session === session && !authenticated) {
          remotePeer = c.peer;
          activate();
          return;
        }
        if (d.kind === "rejected") {
          connectionError("\u9910\u684C\u5DF2\u7ECF\u5750\u6EE1\uFF0C\u6216\u539F\u6765\u7684\u8FDE\u63A5\u8EAB\u4EFD\u5DF2\u5931\u6548\u3002\u8BF7\u91CD\u65B0\u7EA6\u4E00\u684C\u3002");
          return;
        }
        if (!authenticated || net2.conn !== c || d.session !== session) return;
        lastSeen = Date.now();
        if (d.kind === "ping") raw({ kind: "pong", session, protocol: 3 });
        else if (d.kind !== "pong") link.receive(d);
      });
      const lost = () => {
        clearTimeout(candidateTimer);
        candidateTimers.delete(candidateTimer);
        candidates.delete(c);
        if (pendingConn === c) pendingConn = null;
        if (!valid() || net2.conn !== c) return;
        pause();
        tryReconnect();
      };
      c.on("close", lost);
      c.on("error", lost);
    }
    function room() {
      phaseTo2("room");
      app2.innerHTML = `<section class="handoff"><div class="handoff-card"><span class="script">A table, just for two</span><h1>\u5357\u74DC\u706F\u4E0B\u7684\u623F\u95F4</h1><p>\u628A\u53E3\u4EE4\u4EA4\u7ED9\u53E6\u4E00\u4F4D\u5973\u5DEB\uFF0C\u8BA9\u5979\u5750\u5230\u5BF9\u9762\u3002</p><div class="room-code" id="roomCode">${net2.roomCode}</div><button id="copyRoom" class="text-button">\u590D\u5236\u623F\u95F4\u53E3\u4EE4</button><div class="room-players">${net2.netNames.map((n, p) => `<div>${avatar(p)}<p>${esc(n)}</p></div>`).join("")}</div><p class="connection-state" id="roomStatus">${net2.netConnected ? "\u5BF9\u684C\u5DF2\u7ECF\u5165\u5E2D\uFF0C\u4ECA\u665A\u53EF\u4EE5\u5F00\u5BB4\u4E86\u3002" : "\u706F\u5DF2\u7ECF\u70B9\u597D\uFF0C\u7B49\u53E6\u4E00\u4F4D\u5973\u5DEB\u8F93\u5165\u53E3\u4EE4\u3002"}</p><button class="btn-purple" id="onlineBegin" ${!net2.netConnected || net2.netSlot === 1 ? "disabled" : ""}>${net2.netSlot === 0 ? "\u53CC\u65B9\u5230\u9F50\uFF0C\u79D8\u5BC6\u9009\u6BD2" : "\u7B49\u623F\u4E3B\u62C6\u5F00\u83DC\u5355"}</button><br><button class="text-button" id="roomLeave">\u6536\u597D\u53E3\u4EE4\uFF0C\u5148\u79BB\u5E2D</button>${sticker("ghost-lantern", "corner-ghost")}${sticker("potion", "corner-potion")}</div></section>`;
      on2("copyRoom", async () => {
        try {
          await navigator.clipboard.writeText(net2.roomCode);
          toast2("\u53E3\u4EE4\u5DF2\u590D\u5236\uFF1A" + net2.roomCode);
        } catch {
          toast2("\u623F\u95F4\u53E3\u4EE4\u662F " + net2.roomCode);
        }
      });
      on2("onlineBegin", onlineStart2);
      on2("roomLeave", home2);
    }
    function onlineStart2() {
      if (net2.netSlot !== 0 || !net2.netConnected || state2.r && !net2.verified)
        return;
      state2.theme = makeSweetTable();
      const payload = {
        type: "start",
        theme: state2.theme.id,
        dishKeys: state2.theme.dishes.map((d) => d.key),
        first: net2.netSeq % 2,
        sequence: net2.netSeq + 1,
        names: net2.netNames
      };
      send2(payload);
      receiveStart(payload);
    }
    function receiveStart(d) {
      if (!validStart(d, new Set(SWEETS.map((s) => s.key))) || d.sequence <= net2.netSeq)
        return;
      net2.netSeq = d.sequence;
      actions.cancelTransition?.();
      state2.epoch++;
      closeModal2(true);
      state2.theme = {
        ...MENU[0],
        dishes: d.dishKeys.map((key, id2) => ({
          ...SWEETS.find((s) => s.key === key),
          id: id2
        }))
      };
      net2.netNames = d.names;
      Object.assign(net2, {
        myCommit: null,
        theirCommit: null,
        mySecret: null,
        mySalt: null,
        onlineStarted: false,
        verified: false,
        revealValid: false,
        theirReady: false
      });
      sealed = false;
      state2.log = [];
      state2.scored = false;
      state2.taste = null;
      state2.secrets = [null, null];
      state2.r = createRound([null, null], d.first);
      transition2("\u4E24\u4EFD\u79D8\u5BC6\uFF0C\u5404\u81EA\u8F7B\u8F7B\u85CF\u597D\u3002", () => pick2(net2.netSlot));
    }
    async function sealOnline2(id2) {
      if (sealed || !net2.netConnected || !Number.isInteger(id2) || id2 < 0 || id2 > 15)
        return;
      sealed = true;
      const generation = net2.generation, round = net2.netSeq;
      net2.mySecret = id2;
      net2.mySalt = crypto.randomUUID();
      handoff2(
        net2.netSlot,
        "\u8FD9\u4EFD\u79D8\u5BC6\uFF0C\u5DF2\u7ECF\u5C01\u597D\u4E86",
        "\u6BD2\u836F\u7684\u4F4D\u7F6E\u7559\u5728\u81EA\u5DF1\u7684\u53E3\u888B\u91CC\u3002<br>\u7B49\u5BF9\u684C\u4E5F\u9009\u5B8C\uFF0C\u4E24\u8FB9\u5C31\u4F1A\u4E00\u8D77\u5F00\u5BB4\u3002",
        "\u7B49\u5BF9\u684C\u5C01\u597D\u79D8\u5BC6\u2026",
        () => {
        },
        false
      );
      if ($("handoffGo")) $("handoffGo").disabled = true;
      const hash = await commitment(net2.roomCode, round, id2, net2.mySalt);
      if (generation !== net2.generation || round !== net2.netSeq) return;
      net2.myCommit = hash;
      state2.r.poison[net2.netSlot] = id2;
      send2({ type: "commit", hash });
      serveOnline();
    }
    function serveOnline() {
      if (net2.onlineStarted || !net2.myCommit || !net2.theirCommit) return;
      net2.onlineStarted = true;
      transition2("\u79D8\u5BC6\u9F50\u4E86\uFF0C\u9910\u5177\u4E5F\u51C6\u5907\u597D\u4E86\u3002", board2);
    }
    function networkVerdict(d) {
      if (!validVerdict(d, state2.log.length) || !state2.r || state2.r.over || state2.r.eaten.flat().includes(d.id))
        return;
      const player = state2.r.turn;
      state2.r.eaten[player].push(d.id);
      if (d.hit) {
        state2.r.over = true;
        state2.r.winner = 1 - player;
        send2({ type: "reveal", secret: net2.mySecret, salt: net2.mySalt });
      }
      recordTaste2(d.id, d.k, player, d.hit);
      showFeedback2(d.id, d.k, player, d.hit, player === net2.netSlot && !d.hit);
    }
    function finalizeResult() {
      if (net2.verified || !net2.revealValid || !net2.theirReady) return;
      net2.verified = true;
      awardRound2();
      const last = state2.log.at(-1);
      if (state2.phase === "end") ending2();
      else
        showFeedback2(
          last.id,
          last.k,
          last.player,
          true,
          last.player === net2.netSlot
        );
    }
    async function handleNetwork(d) {
      if (!d || typeof d.type !== "string") return;
      if ([
        "commit",
        "taste",
        "verdict",
        "advance",
        "reveal",
        "verified",
        "reaction"
      ].includes(d.type) && d.round !== net2.netSeq)
        return;
      if (d.type === "welcome" && net2.netSlot === 1 && net2.netSeq === 0) {
        if (!Array.isArray(d.names) || d.names.length !== 2 || !d.names.every((n) => typeof n === "string" && n.length <= 12))
          return;
        net2.netNames = d.names;
        closeModal2(true);
        room();
      } else if (d.type === "start" && net2.netSlot === 1) receiveStart(d);
      else if (d.type === "commit" && state2.r && !net2.onlineStarted && /^[a-f0-9]{64}$/.test(d.hash)) {
        if (!net2.theirCommit) net2.theirCommit = d.hash;
        serveOnline();
      } else if (d.type === "taste" && net2.onlineStarted && state2.r && state2.r.turn !== net2.netSlot && !state2.r.over && validTaste(d, state2.log.length) && !state2.r.eaten.flat().includes(d.id)) {
        const answer = {
          type: "verdict",
          id: d.id,
          k: d.k,
          no: d.no,
          hit: d.id === net2.mySecret || d.ownHit
        };
        send2(answer);
        networkVerdict(answer);
      } else if (d.type === "verdict" && state2.r?.turn === net2.netSlot && state2.taste?.resolved && d.id === state2.taste.id && d.k === state2.taste.k && validVerdict(d, state2.log.length)) {
        networkVerdict(d);
      } else if (d.type === "advance" && state2.r && state2.r.turn !== net2.netSlot && d.no === state2.log.length && state2.taste && state2.log.at(-1)?.id === state2.taste.id && (!state2.r.over || net2.verified)) {
        doAdvance2();
      } else if (d.type === "reveal" && state2.r?.over && !net2.revealValid && Number.isInteger(d.secret) && d.secret >= 0 && d.secret < 16 && typeof d.salt === "string" && d.salt.length <= 100) {
        const generation = net2.generation, round = net2.netSeq;
        const hash = await commitment(net2.roomCode, round, d.secret, d.salt);
        if (generation !== net2.generation || round !== net2.netSeq) return;
        const poisons = [...state2.r.poison];
        poisons[1 - net2.netSlot] = d.secret;
        if (hash !== net2.theirCommit || !validFinishedRound(state2.log, poisons, state2.r.winner)) {
          banner(
            "\u53CC\u65B9\u5C01\u5B58\u6216\u56DE\u5408\u8BB0\u5F55\u6821\u9A8C\u4E0D\u4E00\u81F4\uFF0C\u672C\u5C40\u4E0D\u8BA1\u5206\u3002\u8BF7\u56DE\u5230\u8BF7\u67EC\u91CD\u65B0\u5F00\u5C40\u3002"
          );
          return;
        }
        state2.r.poison = poisons;
        net2.revealValid = true;
        send2({ type: "verified", no: state2.log.length, winner: state2.r.winner });
        finalizeResult();
      } else if (d.type === "verified" && state2.r?.over && d.no === state2.log.length && d.winner === state2.r.winner) {
        net2.theirReady = true;
        finalizeResult();
      } else if (d.type === "reaction" && typeof d.text === "string")
        reaction2(d.text.slice(0, 60), net2.netNames[1 - net2.netSlot]);
      else if (d.type === "leave") {
        net2.netConnected = false;
        banner("\u5BF9\u684C\u5DF2\u79BB\u5E2D\u3002\u8BF7\u56DE\u5230\u8BF7\u67EC\uFF0C\u91CD\u65B0\u7EA6\u4E00\u684C\u3002");
        recoveryAt = Date.now() - RECOVERY_MS - 1;
      }
    }
    lifetime2.listen(window, "online", tryReconnect);
    lifetime2.listen(document, "visibilitychange", () => {
      if (document.hidden) return;
      if (session && remotePeer) {
        if (Date.now() - lastSeen > 8e3) {
          pause();
          try {
            net2.conn?.close();
          } catch {
          }
        }
        tryReconnect();
      }
    });
    return {
      resetNet: resetNet2,
      send: send2,
      networkMenu: networkMenu2,
      onlineStart: onlineStart2,
      sealOnline: sealOnline2,
      joinRoom,
      destroy() {
        resetNet2();
        lifetime2.destroy();
      }
    };
  }

  // src/app.js
  var lifetime = createLifetime();
  var ui = createUI();
  var { app, modal, openModal, closeModal, toast, on } = ui;
  var fx = createSfx();
  var sfx = (kind) => fx.play(kind);
  var WitchMotion = createMotion();
  var music = createMusic();
  function save() {
    autoSave();
    if (!persistDb(state.db)) toast("\u6D4F\u89C8\u5668\u6CA1\u6709\u5141\u8BB8\u4FDD\u5B58\uFF1B\u8BF7\u5BFC\u51FA\u5907\u4EFD\u4FDD\u7559\u8FDB\u5EA6\u3002");
  }
  function autoSave() {
    const v = snapshot(state);
    if (v && state.r && ["dine", "end"].includes(state.phase)) writeAuto(v);
  }
  function phaseTo(p, scroll = true) {
    state.phase = p;
    document.body.classList.toggle("privacy", ["pick", "handoff"].includes(p));
    document.body.classList.toggle("at-home", p === "home");
    if (scroll)
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    $("noteCount").textContent = state.db.notes.length;
    document.body.dataset.phase = p;
    requestAnimationFrame(autoSave);
  }
  function transition(text2, fn) {
    if (state.transitioning) return;
    state.transitioning = true;
    const token = state.epoch;
    WitchMotion.transition(text2, () => {
      state.transitioning = false;
      if (token === state.epoch) fn();
    });
  }
  function burst(poison = false) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("i");
      p.className = "taste-particle";
      p.textContent = i % 3 ? "\u2727" : "\xB7";
      p.style.cssText = `--dx:${(Math.random() - 0.5) * 600}px;--dy:${(Math.random() - 0.7) * 440}px;--rot:${Math.random() * 360}deg;--delay:${Math.random() * 0.15}s;color:${poison ? "#bb85df" : "#e6b974"}`;
      document.body.append(p);
      lifetime.delay(() => p.remove(), 1800);
    }
  }
  function home() {
    WitchMotion.cancelTransition();
    state.transitioning = false;
    state.epoch++;
    resetNet();
    state.taste = null;
    closeModal(true);
    state.r = null;
    state.secrets = [null, null];
    phaseTo("home");
    let n = names(), s = state.db.scores[state.mode];
    app.innerHTML = homeView(n, s);
    app.querySelectorAll("[data-character]").forEach(
      (b) => b.onclick = () => {
        b.classList.toggle("flipped");
        sfx();
      }
    );
    on("chooseMenu", chooseMenu);
    on("scores", scores);
    on("startGame", () => state.mode === "online" ? networkMenu() : start());
    app.querySelectorAll("[data-mode]").forEach(
      (b) => b.onclick = () => {
        state.mode = b.dataset.mode;
        home();
      }
    );
  }
  function handoff(p, title, text2, label, fn, namesForm = false) {
    phaseTo("handoff");
    app.innerHTML = handoffView(p, title, text2, label, namesForm);
    on("handoffGo", () => {
      if (namesForm) {
        state.db.names = [
          $("name0").value.trim() || "\u5C0F\u5357\u74DC",
          $("name1").value.trim() || "\u5C0F\u6708\u4EAE"
        ];
        save();
      }
      fn();
    });
    on("handoffHome", home);
  }
  function start() {
    if (state.mode !== "online") state.theme = makeSweetTable();
    state.epoch++;
    state.secrets = [null, null];
    state.selected = null;
    state.log = [];
    state.scored = false;
    state.taste = null;
    state.r = null;
    if (state.mode === "solo") {
      state.secrets[1] = randomIndex(16);
      transition(
        "\u70DB\u706B\u4EAE\u4E86\uFF0C\u5979\u5DF2\u7ECF\u85CF\u597D\u79D8\u5BC6\u3002",
        () => handoff(
          0,
          "\u5618\uFF01\u5077\u5077\u7ED9\u5979\u52A0\u70B9\u6599",
          "\u5BF9\u684C\u5973\u5DEB\u5DF2\u7ECF\u9009\u597D\u6BD2\u836F\uFF0C\u4E0D\u4F1A\u4E2D\u9014\u66F4\u6539\u3002<br>\u73B0\u5728\u8F6E\u5230\u4F60\uFF0C\u628A\u4E00\u6EF4\u5C0F\u5C0F\u7684\u79D8\u5BC6\u85CF\u8FDB\u7F8E\u5473\u91CC\u3002",
          "\u53EA\u6709\u6211\u5728\u770B\uFF0C\u5F00\u59CB\u9009\u6BD2",
          () => pick(0)
        )
      );
    } else
      transition(
        "\u574F\u5FC3\u773C\u52A0\u8F7D\u4E2D\u2026\u2026\u563F\u563F\uFF01",
        () => handoff(
          0,
          "\u5148\u628A\u5C4F\u5E55\u4EA4\u7ED9\u7B2C\u4E00\u4F4D",
          "\u53E6\u4E00\u4F4D\u5148\u8F6C\u8FC7\u8EAB\uFF0C\u501F\u6211\u4E00\u70B9\u70B9\u79D8\u5BC6\u65F6\u95F4\u3002<br>\u786E\u8BA4\u540E\uFF0C\u684C\u9762\u4F1A\u81EA\u52A8\u906E\u4F4F\uFF0C\u518D\u4EA4\u7ED9\u5BF9\u65B9\u3002",
          "\u53EA\u6709\u6211\u5728\u770B\uFF0C\u5F00\u59CB\u9009\u6BD2",
          () => pick(0),
          true
        )
      );
  }
  function pick(p) {
    state.selecting = p;
    state.selected = null;
    renderPick();
  }
  function renderPick(keep = false) {
    let y = scrollY;
    phaseTo("pick", !keep);
    app.innerHTML = pickView();
    app.querySelectorAll("[data-dish]").forEach(
      (b) => b.onclick = () => {
        state.selected = +b.dataset.dish;
        renderPick(true);
        sfx("safe");
        WitchMotion.pop(app.querySelector(".dish.selected"), "\u5C31\u4F60\u5566\uFF01");
      }
    );
    on("lockSecret", lockSecret);
    on("cover", () => {
      state.selected = null;
      handoff(
        state.selecting,
        "\u5618\uFF0C\u684C\u9762\u66FF\u4F60\u906E\u597D\u4E86",
        "\u8BF7\u786E\u8BA4\u53EA\u6709\u4F60\u5728\u770B\uFF0C\u518D\u56DE\u6765\u9009\u6BD2\u3002",
        "\u7EE7\u7EED\u6211\u7684\u79D8\u5BC6",
        () => pick(state.selecting)
      );
    });
    on("leave", leave);
    if (keep)
      window.scrollTo({
        top: y,
        behavior: "instant"
      });
  }
  async function lockSecret() {
    if (state.mode === "online" && !net.netConnected) return;
    WitchMotion.flock();
    if (state.selected === null) return;
    state.secrets[state.selecting] = state.selected;
    state.selected = null;
    sfx();
    if (state.mode === "online") {
      await sealOnline(state.secrets[state.selecting]);
      return;
    }
    if (state.mode === "local" && state.selecting === 0) {
      handoff(
        1,
        "\u5C01\u597D\u5566\uFF01\u8C01\u770B\u8C01\u662F\u5C0F\u5357\u74DC",
        "\u73B0\u5728\u8BF7\u628A\u5C4F\u5E55\u4EA4\u7ED9\u7B2C\u4E8C\u4F4D\u3002<br>\u7B2C\u4E00\u4F4D\u5148\u8F6C\u8FC7\u8EAB\uFF0C\u522B\u5077\u770B\u5973\u5DEB\u7684\u5C0F\u5FC3\u601D\u3002",
        "\u7B2C\u4E8C\u4F4D\u62FF\u5230\u5C4F\u5E55\u4E86",
        () => pick(1)
      );
    } else {
      handoff(
        0,
        "\u563F\u563F\uFF0C\u574F\u5FC3\u773C\u90FD\u5C31\u4F4D\u5566",
        "\u4E00\u684C\u5171\u4EAB\uFF0C\u5403\u8FC7\u7684\u83DC\u5C31\u4F1A\u7559\u4E0B\u7A7A\u76D8\u3002<br>\u5148\u5403\u5230\u4EFB\u610F\u4E00\u4EFD\u6BD2\u836F\u7684\u4EBA\uFF0C\u8981\u5148\u79BB\u5E2D\u3002",
        "\u751C\u54C1\u5230\u9F50\uFF01\u5F00\u70AB\uFF01",
        () => {
          state.r = createRound(state.secrets, state.db.rounds[state.mode] % 2);
          state.secrets = [null, null];
          transition("\u5C0F\u53C9\u5B50\u96C6\u5408\uFF01\u5634\u998B\u51FA\u51FB\uFF01", () => {
            board();
            if (state.mode === "solo" && state.r.turn === 1) botTurn();
          });
        }
      );
    }
  }
  function board(keep = false) {
    const y = scrollY, p = state.r.turn, n = names(), left = 16 - state.r.eaten.flat().length;
    phaseTo("dine", !keep);
    app.innerHTML = boardView(p, n, left);
    on("leave", leave);
    on("openNotes", journal);
    app.querySelectorAll("[data-react]").forEach(
      (b) => b.onclick = () => {
        reaction(b.dataset.react, n[state.mode === "online" ? net.netSlot : p]);
        if (state.mode === "online")
          send({
            type: "reaction",
            text: b.dataset.react
          });
      }
    );
    app.querySelectorAll("[data-dish]:not(:disabled)").forEach((b) => {
      let timer;
      const token = state.epoch;
      const id2 = +b.dataset.dish;
      b.onpointerdown = (e) => {
        if (e.button !== 0) return;
        b.classList.add("holding");
        timer = lifetime.delay(() => {
          b.classList.remove("holding");
          if (token === state.epoch && b.isConnected) present(id2, false);
        }, 650);
      };
      const clear = () => {
        lifetime.cancel(timer);
        b.classList.remove("holding");
      };
      b.onpointerup = clear;
      b.onpointerleave = clear;
      b.onpointercancel = clear;
      b.onclick = () => {
        clear();
        present(id2, false);
      };
    });
    if (keep)
      window.scrollTo({
        top: y,
        behavior: "instant"
      });
  }
  function reaction(text2, name) {
    document.querySelector(".bluff-bubble")?.remove();
    const el = document.createElement("div");
    el.className = "bluff-bubble";
    el.textContent = name + "\uFF1A\u201C" + text2 + "\u201D";
    document.body.append(el);
    lifetime.delay(() => el.remove(), 3200);
  }
  function botTurn() {
    const token = state.epoch;
    lifetime.delay(() => {
      if (token !== state.epoch || state.phase !== "dine" || state.r.over || state.r.turn !== 1 || state.taste)
        return;
      const id2 = chooseDish(state.r.poison[1], state.r.eaten.flat());
      present(id2, true);
    }, 1100);
  }
  function present(id2, bot = false) {
    if (!state.r || state.mode === "online" && (!net.netConnected || state.r.turn !== net.netSlot) || state.taste || state.r.over || state.r.eaten.flat().includes(id2))
      return;
    const p = state.r.turn;
    let d = state.theme.dishes[id2];
    state.taste = {
      id: id2,
      player: p,
      resolved: false,
      bot
    };
    sfx("bite");
    openModal(
      `<div class="taste-scene"><div class="plating"><i class="plate-glow"></i><div class="hero-plate">${photo(id2)}<span class="dish-no">DISH N\xB0 ${pad(id2 + 1)}</span></div><h2 class="food-title">${d.name}</h2><span class="serving">SERVED WARM, WITH A LITTLE SECRET</span></div><div class="character-dialogue"><div class="speaker">${avatar(p)}<div><span class="speaker-name">${esc(names()[p])}</span><span class="speaker-tag">${bot ? "SHE TAKES A LITTLE BITE" : "A LITTLE BITE, A LITTLE JOY"}</span></div></div><div class="speech-bubble"><span class="bubble-kicker">${bot ? "Her little tasting note" : "\u54FC\u54FC\uFF0C\u8BA9\u6211\u54C1\u9274\u4E00\u4E0B"}</span><p>${bot ? "\u54FC\u54FC\uFF0C\u8F6E\u5230\u672C\u5973\u5DEB\u7684\u7F8E\u98DF\u6D4B\u8BC4\u65F6\u95F4\uFF01\u8BA9\u6211\u5148\u6316\u4E00\u5927\u52FA\u2026\u2026" : "\u5C0F\u53C9\u5B50\u5C31\u4F4D\uFF01\u8FD9\u53E3\u770B\u8D77\u6765\u5F88\u4F1A\u62FF\u634F\u6211\u8BF6\u3002<br>\u554A\u2014\u2014\u545C\uFF01\u4F60\u89C9\u5F97\u662F\u54EA\u79CD\u597D\u5403\uFF1F"}</p></div><p class="taste-hint">${bot ? "\u56BC\u56BC\u56BC\u2026\u2026\u5979\u7684\u5C0F\u8111\u888B\u6B63\u5728\u52A0\u8F7D\u3002" : "\u9009\u4E00\u53E5\uFF0C\u66FF\u4F60\u7684\u5634\u5DF4\u53D1\u8A00\uFF5E"}</p><div class="flavors">${bot ? "" : d.options.map((o, k) => `<button class="flavor" data-flavor="${k}"><span class="flavor-index">${["I", "II", "III"][k]}</span>${o.label}</button>`).join("")}</div></div></div>${sticker("stretch-cat", "taste-sticker cat")}${sticker("cupcake", "taste-sticker cup")}`,
      "taste-card",
      true
    );
    const token = state.epoch;
    if (bot)
      lifetime.delay(() => {
        if (token !== state.epoch) return;
        if (state.taste?.id === id2 && !state.taste.resolved)
          resolveTaste(randomIndex(3));
      }, 750);
    else
      modal.querySelectorAll("[data-flavor]").forEach((b) => b.onclick = () => resolveTaste(+b.dataset.flavor));
  }
  function foodComment(id2, k) {
    if (state.theme.id === "sweet") return state.theme.dishes[id2].options[k].text;
    let d = state.theme.dishes[id2], o = d.options[k];
    if (state.theme.id === "restaurant") return o.text;
    let last = state.theme.id === "dessert" ? o.label.includes("\u9165") ? "\u76D8\u5B50\u63A5\u7A33\uFF0C\u6211\u8981\u5F00\u59CB\u6389\u9165\u5C51\u4E86\u3002" : o.label.includes("\u5976") ? "\u5634\u89D2\u7684\u8FD9\u4E00\u70B9\u5976\u6CB9\uFF0C\u4E5F\u4E0D\u80FD\u6D6A\u8D39\u3002" : "\u5403\u5B8C\u8FD9\u4E00\u5C0F\u53E3\uFF0C\u518D\u8BA4\u771F\u63D0\u9632\u5973\u5DEB\u597D\u4E86\u3002" : state.theme.id === "grill" ? o.label.includes("\u6C41") ? "\u5148\u522B\u50AC\uFF0C\u6211\u8981\u628A\u8FD9\u4E00\u53E3\u9C9C\u6C41\u5403\u5E72\u51C0\u3002" : "\u597D\u9999\u2026\u2026\u521A\u624D\u662F\u4E0D\u662F\u8BF4\u53EA\u5C1D\u4E00\u70B9\u70B9\u6765\u7740\uFF1F" : state.theme.id === "huazhao" ? "\u5C0F\u53E3\u4E00\u70B9\uFF0C\u820D\u4E0D\u5F97\u628A\u8FD9\u4E48\u6F02\u4EAE\u7684\u70B9\u5FC3\u5403\u5F97\u592A\u5FEB\u3002" : "\u9910\u5177\u5148\u522B\u6536\uFF0C\u8FD9\u53E3\u6211\u8FD8\u6CA1\u56DE\u5473\u5B8C\u5462\u3002";
    return o.text + " " + last;
  }
  function resolveTaste(k) {
    if (!state.taste || state.taste.resolved || state.mode === "online" && !net.netConnected)
      return;
    state.taste.resolved = true;
    state.taste.k = k;
    WitchMotion.bite();
    sfx("bite");
    const { id: id2, player } = state.taste;
    if (state.mode === "online") {
      modal.querySelector(".flavors").innerHTML = '<p class="waiting-small">\u9910\u5177\u8F7B\u8F7B\u653E\u4E0B\uFF0C\u7B49\u5BF9\u684C\u63ED\u6653\u8FD9\u4E00\u53E3\u2026</p>';
      send({
        type: "taste",
        id: id2,
        k,
        no: state.log.length,
        ownHit: id2 === net.mySecret
      });
      return;
    }
    const v = eat(state.r, player, id2);
    if (!v.ok) return;
    recordTaste(id2, k, player, v.poisoned);
    const token = state.epoch;
    lifetime.delay(() => {
      if (token === state.epoch && state.taste?.id === id2)
        showFeedback(id2, k, player, v.poisoned, true);
    }, 430);
  }
  function recordTaste(id2, k, player, hit) {
    const o = state.theme.dishes[id2].options[k];
    state.log.push({
      id: id2,
      k,
      player,
      label: o.label,
      hit
    });
    state.db.notes.unshift({
      theme: state.theme.id,
      id: id2,
      k,
      label: o.label,
      text: foodComment(id2, k),
      dishName: state.theme.dishes[id2].name,
      image: state.theme.dishes[id2].image,
      name: names()[player],
      hit
    });
    state.db.notes = state.db.notes.slice(0, 100);
    if (hit && state.mode !== "online") awardRound();
    save();
    $("noteCount").textContent = state.db.notes.length;
  }
  function awardRound() {
    if (state.scored || !state.r?.over || state.mode === "online" && !net.verified)
      return;
    state.scored = true;
    const winner = state.r.winner;
    state.db.scores[state.mode][winner]++;
    state.db.rounds[state.mode]++;
    if (state.mode === "online") net.sessionScores[winner]++;
    save();
  }
  function showFeedback(id2, k, player, hit, canContinue) {
    const d = state.theme.dishes[id2], o = d.options[k];
    if (modal.hidden || !modal.querySelector(".character-dialogue")) {
      state.taste = {
        id: id2,
        player,
        resolved: true,
        bot: false
      };
      openModal(
        `<div class="taste-scene"><div class="plating"><i class="plate-glow"></i><div class="hero-plate">${photo(id2)}<span class="dish-no">DISH N\xB0 ${pad(id2 + 1)}</span></div><h2 class="food-title">${d.name}</h2><span class="serving">A BITE SHARED ACROSS THE TABLE</span></div><div class="character-dialogue"></div></div>${sticker("stretch-cat", "taste-sticker cat")}${sticker("cupcake", "taste-sticker cup")}`,
        "taste-card",
        true
      );
    }
    modal.querySelector(".taste-card").classList.add("feedback-ready");
    modal.querySelector(".taste-card").classList.toggle("poisoned", hit);
    modal.querySelector(".hero-plate").classList.add("bitten");
    modal.querySelector(".character-dialogue").innerHTML = `<div class="speaker">${avatar(player)}<div><span class="speaker-name">${esc(names()[player])}</span><span class="speaker-tag">${hit ? "A DELICIOUS LITTLE TRAP" : "Her little tasting note"}</span></div></div><div class="speech-bubble"><span class="bubble-kicker">${hit ? "\u53EF\u6076\uFF01\uFF01\uFF01" : "\u9707\u64BC\u7F8E\u5473\uFF01\uFF01\uFF01"}</span><span class="bubble-title">\u201C${o.label}\u3002\u201D</span><p>${foodComment(id2, k)}</p></div><span class="verdict">${hit ? "\u545C\u54C7\uFF01\u4E2D\u62DB\u4E86\uFF01\u6211\u7684\u996D\u642D\u5B50\u7ADF\u7136\u6F14\u6211\uFF01\uFF01" : "\u53EE\uFF01\u5B89\u5168\u843D\u809A\uFF5E\u518D\u70AB\u4E00\u53E3\u7684\u5FC3\u5DF2\u7ECF\u6309\u4E0D\u4F4F\u4E86"}</span>${hit ? `<p class="poison-detail">\u521A\u5938\u5B8C\u5B83\u597D\u5403\uFF0C\u5B83\u5C31\u7ED9\u6211\u4E0A\u4E86\u4E00\u8BFE\u3002<br>\u8FD9\u53E3\u6709\u6BD2\uFF0C\u4F46\u6211\u7684\u5634\u8FD8\u5728\u8BF4\uFF1A\u597D\u9999\u2026\u2026</p>` : ""}<button class="btn-purple taste-next" id="tasteNext" ${!canContinue ? "disabled" : ""}>${!canContinue ? hit && !net.verified && state.mode === "online" ? "\u7B49\u53CC\u65B9\u62C6\u5F00\u5C01\u6761\u2026" : "\u7B49\u5BF9\u684C\u653E\u4E0B\u9910\u5177\u2026" : hit ? "\u53EF\u6076\uFF01\u8BA9\u6211\u770B\u770B\u662F\u8C01\u5E72\u7684" : state.mode === "solo" && player === 0 ? "\u6211\u6D3B\u7740\uFF01\u6362\u4F60\u70AB\u4E00\u53E3" : "\u628A\u9910\u5177\u4EA4\u7ED9 " + esc(names()[1 - player])}</button>`;
    sfx(hit ? "poison" : "safe");
    burst(hit);
    WitchMotion.verdict(hit);
    if (canContinue) on("tasteNext", advance);
    $("tasteNext")?.focus({
      preventScroll: true
    });
  }
  function advance() {
    if (!state.taste || state.mode === "online" && (!net.netConnected || state.r.over && !net.verified))
      return;
    if (state.mode === "online")
      send({
        type: "advance",
        no: state.log.length
      });
    doAdvance();
  }
  function doAdvance() {
    state.taste = null;
    closeModal(true);
    if (state.r.over) {
      transition("\u597D\u5403\u662F\u771F\u7684\uFF0C\u4E0A\u5F53\u4E5F\u662F\u771F\u7684\uFF01", ending);
    } else {
      next(state.r);
      board(true);
      if (state.mode === "solo" && state.r.turn === 1) botTurn();
    }
  }
  function ending() {
    phaseTo("end");
    const n = names(), winner = state.r.winner, s = state.mode === "online" ? net.sessionScores : state.db.scores[state.mode];
    app.innerHTML = endingView(n, winner, s);
    on("changeTable", home);
    on("again", () => {
      if (state.mode === "online") {
        if (net.netSlot === 0) onlineStart();
        else toast("\u7B49\u623F\u4E3B\u70B9\u201C\u518D\u8D74\u4E00\u5C40\u201D\uFF0C\u4E24\u8FB9\u5C31\u4F1A\u4E00\u8D77\u5F00\u5BB4\u3002");
      } else start();
    });
    sfx("victory");
    burst();
    WitchMotion.flock();
  }
  function leave() {
    if (state.mode === "online" && state.phase === "room") {
      home();
      return;
    }
    openModal(
      '<span class="eyebrow">A LITTLE PAUSE</span><h2>\u5148\u628A\u9910\u5177\u653E\u4E0B\u5417\uFF1F</h2><p>\u8FD9\u4E00\u5C40\u5C1A\u672A\u7ED3\u675F\uFF0C\u79BB\u5E2D\u4E0D\u4F1A\u8BA1\u5206\u3002\u5DF2\u7ECF\u5403\u8FC7\u7684\u7F8E\u5473\u4F1A\u7559\u5728\u624B\u8D26\u91CC\u3002</p><div class="modal-actions"><button class="btn-purple" id="confirmLeave">\u5148\u56DE\u8BF7\u67EC</button></div>'
    );
    on("confirmLeave", () => {
      send({
        type: "leave"
      });
      home();
    });
  }
  var { chooseMenu, rules, journal, scores, credits } = createContent({ ui });
  var network = createNetwork({
    ui,
    actions: {
      home,
      board,
      pick,
      handoff,
      transition,
      phaseTo,
      cancelTransition() {
        WitchMotion.cancelTransition();
        state.transitioning = false;
      },
      recordTaste,
      awardRound,
      showFeedback,
      doAdvance,
      ending,
      reaction
    }
  });
  var { resetNet, send, networkMenu, onlineStart, sealOnline } = network;
  var saves = createSaves({
    ui,
    actions: {
      home,
      board,
      ending,
      showFeedback,
      botTurn,
      save,
      resetNet,
      autoSave
    }
  });
  on("saveBtn", saves.saveManager);
  on("rulesBtn", rules);
  on("notesBtn", journal);
  on("creditsBtn", credits);
  on(
    "homeBrand",
    () => state.phase === "home" ? null : ["dine", "pick"].includes(state.phase) ? leave() : home()
  );
  for (let i = 0; i < 16; i++) {
    const el = document.createElement("i");
    el.className = "firefly";
    el.style.cssText = `--x:${i * 6.3}%;--d:${24 + i % 7 * 3}s;--delay:${-i * 2.2}s`;
    $("fireflies").append(el);
  }
  lifetime.listen(document, "visibilitychange", () => {
    if (document.hidden && state.phase === "pick" && state.mode !== "online") {
      state.selected = null;
      handoff(
        state.selecting,
        "\u66FF\u4F60\u628A\u79D8\u5BC6\u906E\u4F4F\u4E86",
        "\u521A\u624D\u79BB\u5F00\u65F6\uFF0C\u684C\u9762\u5DF2\u7ECF\u81EA\u52A8\u906E\u597D\u3002<br>\u786E\u8BA4\u53EA\u6709\u4F60\u5728\u770B\uFF0C\u518D\u7EE7\u7EED\u9009\u62E9\u3002",
        "\u7EE7\u7EED\u9009\u6211\u7684\u6BD2\u836F",
        () => pick(state.selecting)
      );
    }
  });
  lifetime.listen(window, "pagehide", (event) => {
    if (event.persisted) return;
    state.epoch++;
    lifetime.destroy();
    ui.destroy();
    WitchMotion.destroy();
    music.destroy();
    network.destroy();
    fx.destroy();
  });
  home();
})();
