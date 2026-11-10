/* ==========================================================================
   MISTER BOOM — МЕНЮ
   --------------------------------------------------------------------------
   Източник: менюто на Mister Boom – Гладстон в Glovo (проверено ноември 2026)
   https://glovoapp.com/en/bg/plovdiv/stores/mister-boom-gladston-pdv

   - Цените са редовните цени от Glovo (без временните промоции) и трябва да
     се потвърдят от ресторанта — в ресторанта може да се различават.
   - Описанията са съставени от списъците със съставки в Glovo.
   - Снимките са продуктовите снимки на ресторанта от Glovo (assets/img/menu).

   ЦЕНИТЕ са в ЦЕНТОВЕ: 740 = 7,40 €.

   УСТРОЙСТВО
   - categories : категориите в лентата (редът = редът на показване)
   - groups     : групи с опции (type "single" = избира се една; "multi" = няколко,
                  до `max`; `included` = колко са безплатни)
   - products   : `light: true` = снимка на светъл фон (показва се „студийно“).
                  Съставки с `removable: true` стават опция „Без …“ — добавяйте
                  такива опции само ако ресторантът ги предлага.
   - id         : латиница без интервали; ползва се в линкове (menu.html#p-cosmos-xl).
   ========================================================================== */

window.MB_MENU = {
  currency: "EUR",
  locale: "bg-BG",

  // Начини на получаване. null = неизвестно → сайтът показва „уточнява се“.
  fulfilment: {
    delivery: { label: "Доставка", fee: null, freeFrom: null, minOrder: 0, eta: null },
    pickup:   { label: "Вземане от ресторанта", fee: 0, eta: null, address: "ул. „Гладстон“ 62, Център, Пловдив" }
  },

  // Кратка бележка горе в менюто. null = скрита.
  notice: "Цени според менюто за доставка. В ресторанта може да се различават.",

  categories: [
    { id: "burgers", label: "Бургери",    intro: "Бриош, 100 г говеждо и чедър в основата на всяка планета.", cols: 3 },
    { id: "chicken", label: "Пиле и веджи", intro: "Хрупкаво пилешко филе или сирене на скара вместо говеждо.", cols: 4 },
    { id: "fries",   label: "Dirty Fries", intro: "Картофки, заредени догоре.", cols: 3 },
    { id: "combos",  label: "Комбо",       intro: "Бургер, картофки, напитка и снакс микс. Има и детски.", cols: 3 },
    { id: "snacks",  label: "Снакс",       intro: "Хапки, кръгчета и картофки за масата.", cols: 4 },
    { id: "shakes",  label: "Шейкове",     intro: "Студени, гъсти, сладки.", cols: 4 },
    { id: "drinks",  label: "Напитки",     intro: "Безалкохолни, бира и вода.", cols: 5 }
  ],

  groups: {
    cokeChoice: {
      label: "Напитка", type: "single", default: "cola",
      options: [
        { id: "cola", label: "Coca-Cola", price: 0 },
        { id: "zero", label: "Coca-Cola Zero", price: 0 }
      ]
    }
  },

  products: [
    /* ---------------- БУРГЕРИ ---------------- */
    { id: "cosmos-xl", category: "burgers", name: "Cosmos XL", price: 940, tags: ["bestseller"], featured: true,
      image: "assets/img/menu/cosmos-xl.jpg", light: true,
      description: "Двойно кюфте с трюфелово майо, печени гъби, хрупкав лук и пармезан.",
      ingredients: [{ name: "Бриош" }, { name: "2 × 100 г говеждо" }, { name: "Чедър" }, { name: "Трюфелово майо" }, { name: "Хрупкав лук" }, { name: "Печени гъби" }, { name: "Пармезан" }], options: [] },
    { id: "dubble-texas", category: "burgers", name: "Dubble Texas", price: 990, tags: ["new"],
      image: "assets/img/menu/dubble-texas.jpg", light: true,
      description: "Двойно кюфте, бекон, опушено BBQ, халапеньо и Doritos Flamin' Hot.",
      ingredients: [{ name: "Бриош" }, { name: "2 × 100 г говеждо" }, { name: "Чедър" }, { name: "Сос „Калифорния“" }, { name: "Бекон" }, { name: "Опушено BBQ" }, { name: "Халапеньо" }, { name: "Айсберг" }, { name: "Лук" }, { name: "Doritos Flamin' Hot" }], options: [] },
    { id: "andromeda", category: "burgers", name: "Andromeda", price: 790, tags: [], badge: "Пловдивски фаворит",
      image: "assets/img/menu/andromeda.jpg",
      description: "Трюфелово майо, сладко от смокини, карамелизиран лук и бекон.",
      ingredients: [{ name: "Бриош" }, { name: "100 г говеждо" }, { name: "Чедър" }, { name: "Трюфелово майо" }, { name: "Сладко от смокини" }, { name: "Карамелизиран лук" }, { name: "Бекон" }], options: [] },
    { id: "titan", category: "burgers", name: "Titan", price: 740, tags: [],
      image: "assets/img/menu/titan.jpg", light: true,
      description: "Дресинг „Калифорния“, бекон, хрупкав лук и разтопен чедър.",
      ingredients: [{ name: "Бриош" }, { name: "100 г 100% говеждо" }, { name: "Дресинг „Калифорния“" }, { name: "Кисели краставички" }, { name: "Лук" }, { name: "Бекон" }, { name: "Хрупкав лук" }, { name: "Разтопен чедър" }], options: [] },
    { id: "jupiter", category: "burgers", name: "Jupiter", price: 740, tags: [],
      image: "assets/img/menu/jupiter.jpg",
      description: "Класически дресинг, кисели краставички, лук и бекон.",
      ingredients: [{ name: "Бриош" }, { name: "100 г говеждо" }, { name: "Чедър" }, { name: "Класически дресинг" }, { name: "Лук" }, { name: "Кисели краставички" }, { name: "Бекон" }], options: [] },
    { id: "neptune", category: "burgers", name: "Neptune", price: 740, tags: [],
      image: "assets/img/menu/neptune.jpg",
      description: "Сос Mister Boom, айсберг, домат и червен лук.",
      ingredients: [{ name: "Бриош" }, { name: "100 г говеждо" }, { name: "Чедър" }, { name: "Сос Mister Boom" }, { name: "Айсберг" }, { name: "Домат" }, { name: "Червен лук" }], options: [] },
    { id: "mars", category: "burgers", name: "Mars", price: 690, tags: [],
      image: "assets/img/menu/mars.jpg", light: true,
      description: "Класиката: майонеза, кетчуп, горчица, лук и краставички.",
      ingredients: [{ name: "Бриош" }, { name: "100 г говеждо" }, { name: "Чедър" }, { name: "Майонеза" }, { name: "Кетчуп" }, { name: "Горчица" }, { name: "Лук" }, { name: "Кисели краставички" }], options: [] },
    { id: "saturn", category: "burgers", name: "Saturn", price: 590, tags: [],
      image: "assets/img/menu/saturn.jpg",
      description: "Само същественото: говеждо и чедър в бриош.",
      ingredients: [{ name: "Бриош" }, { name: "100 г говеждо" }, { name: "Чедър" }], options: [] },

    /* ---------------- ПИЛЕ И ВЕДЖИ ---------------- */
    { id: "nova", category: "chicken", name: "Nova", price: 740, tags: [], badge: "Пилешки",
      image: "assets/img/menu/nova.jpg", light: true,
      description: "Хрупкаво пилешко филе, дресинг Mister Boom, чедър, айсберг и домат.",
      ingredients: [{ name: "Бриош" }, { name: "Хрупкаво пилешко филе" }, { name: "Дресинг Mister Boom" }, { name: "Разтопен чедър" }, { name: "Айсберг" }, { name: "Домат" }, { name: "Лук" }], options: [] },
    { id: "draco", category: "chicken", name: "Spicy Chicken Draco", price: 740, tags: [], badge: "Пикантен",
      image: "assets/img/menu/draco.jpg", light: true,
      description: "Хрупкаво пилешко филе, дресинг „Калифорния“, карамелизиран лук и халапеньо.",
      ingredients: [{ name: "Бриош" }, { name: "Хрупкаво пилешко филе" }, { name: "Разтопен чедър" }, { name: "Дресинг „Калифорния“" }, { name: "Лук" }, { name: "Карамелизиран лук" }, { name: "Халапеньо" }], options: [] },
    { id: "galaxy", category: "chicken", name: "Galaxy", price: 740, tags: [], badge: "Вегетариански",
      image: "assets/img/menu/galaxy.jpg",
      description: "Сирене на скара, дресинг Mister Boom, айсберг и краставички.",
      ingredients: [{ name: "Бриош" }, { name: "Сирене на скара" }, { name: "Дресинг Mister Boom" }, { name: "Айсберг" }, { name: "Кисели краставички" }], options: [] },
    { id: "nebula", category: "chicken", name: "Nebula", price: 740, tags: [], badge: "Вегетариански",
      image: "assets/img/menu/nebula.jpg",
      description: "Сирене на скара, трюфелово майо, сладко от смокини и чедър.",
      ingredients: [{ name: "Бриош" }, { name: "Сирене на скара" }, { name: "Трюфелово майо" }, { name: "Сладко от смокини" }, { name: "Чедър" }, { name: "Карамелизиран лук" }], options: [] },

    /* ---------------- DIRTY FRIES ---------------- */
    { id: "boom-chicken-fries", category: "fries", name: "Boom Chicken Fries", price: 770, tags: [],
      image: "assets/img/menu/boom-chicken-fries.jpg",
      description: "Картофки с хрупкаво пилешко, сос чедър, чеснов сос и хрупкав лук.",
      ingredients: [{ name: "Картофки" }, { name: "Хрупкаво пилешко филе" }, { name: "Разтопен сос чедър" }, { name: "Чеснов сос" }, { name: "Хрупкав лук" }], options: [] },
    { id: "garlic-parmesan-fries", category: "fries", name: "Garlic Parmesan Fries", price: 770, tags: [],
      image: "assets/img/menu/garlic-parmesan-fries.jpg",
      description: "Картофки с хрупкаво пилешко, чеснов сос, пармезан и магданоз.",
      ingredients: [{ name: "Картофки" }, { name: "Хрупкаво пилешко филе" }, { name: "Чеснов сос" }, { name: "Пармезан" }, { name: "Магданоз" }], options: [] },
    { id: "spicy-chicken-fries", category: "fries", name: "Spicy Chicken Fries", price: 770, tags: [],
      image: "assets/img/menu/spicy-chicken-fries.jpg",
      description: "Пилешко, сос чедър, халапеньо, майо с мед и срирача, люспи чили.",
      ingredients: [{ name: "Картофки" }, { name: "Хрупкаво пилешко филе" }, { name: "Разтопен сос чедър" }, { name: "Халапеньо" }, { name: "Майо с мед и срирача" }, { name: "Люспи чили" }], options: [] },
    { id: "sweet-fries", category: "fries", name: "Sweet Fries", price: 740, tags: ["new"],
      image: "assets/img/menu/sweet-fries.jpg",
      description: "Сладък картоф с трюфелово майо и пико де гайо.",
      ingredients: [{ name: "Картофки от сладък картоф" }, { name: "Трюфелово майо" }, { name: "Пико де гайо" }], options: [] },
    { id: "moon-fries", category: "fries", name: "Moon Fries", price: 590, tags: [],
      image: "assets/img/menu/moon-fries.jpg", light: true,
      description: "Сос чедър, майо с мед и срирача, лук и халапеньо.",
      ingredients: [{ name: "Хрупкави картофки" }, { name: "Разтопен сос чедър" }, { name: "Майо с мед и срирача" }, { name: "Лук" }, { name: "Халапеньо" }], options: [] },
    { id: "truffle-cheese-fries", category: "fries", name: "Truffle Cheese Fries", price: 590, tags: [],
      image: "assets/img/menu/truffle-cheese-fries.jpg", light: true,
      description: "Трюфелово майо, хрупкав лук и пармезан.",
      ingredients: [{ name: "Хрупкави картофки" }, { name: "Трюфелово майо" }, { name: "Хрупкав лук" }, { name: "Пармезан" }], options: [] },

    /* ---------------- КОМБО ---------------- */
    { id: "kombo-single", category: "combos", name: "Boom's Kombo Single", price: 1395, tags: ["bestseller"], featured: true,
      image: "assets/img/menu/kombo-single.jpg", light: true,
      description: "Бургер Neptune, Boom Fries, напитка, снакс микс и дип сос.",
      ingredients: [{ name: "Бургер Neptune" }, { name: "Boom Fries" }, { name: "Напитка" }, { name: "Снакс микс" }, { name: "Дип сос" }], options: [] },
    { id: "kombo-x2", category: "combos", name: "Boom Комбо ×2", price: 2745, tags: ["bestseller"],
      image: "assets/img/menu/kombo-x2.jpg", light: true,
      description: "2 × Neptune, 2 × Boom Fries, 2 напитки и снакс микс.",
      ingredients: [{ name: "2 × бургер Neptune" }, { name: "2 × Boom Fries" }, { name: "2 × напитка" }, { name: "Снакс микс" }], options: [] },
    { id: "kombo-x4", category: "combos", name: "Boom's Kombo ×4", price: 5495, tags: [],
      image: "assets/img/menu/kombo-x4.jpg", light: true,
      description: "4 × Neptune, 3 × Boom Fries, Truffle Cheese Fries, 4 напитки, снакс микс и 2 дип соса.",
      ingredients: [{ name: "4 × бургер Neptune" }, { name: "3 × Boom Fries" }, { name: "1 × Truffle Cheese Fries" }, { name: "4 × напитка" }, { name: "Снакс микс" }, { name: "2 × дип сос" }], options: [] },
    { id: "andromeda-kombo", category: "combos", name: "Andromeda Kombo", price: 1495, tags: [],
      image: "assets/img/menu/andromeda-kombo.jpg", light: true,
      description: "Andromeda, малки картофки, напитка по избор (кен), снакс микс и сос.",
      ingredients: [{ name: "Бургер Andromeda" }, { name: "Малки картофки" }, { name: "Напитка по избор (кен)" }, { name: "Снакс микс" }, { name: "Сос" }], options: [] },
    { id: "texas-kombo", category: "combos", name: "Dubble Texas Kombo", price: 1695, tags: [],
      image: "assets/img/menu/texas-kombo.jpg", light: true,
      description: "Dubble Texas, малки картофки, Coca-Cola или Zero, снакс микс и сос.",
      ingredients: [{ name: "Бургер Dubble Texas" }, { name: "Малки картофки" }, { name: "Coca-Cola или Coca-Cola Zero" }, { name: "Снакс микс" }, { name: "Сос" }],
      options: [{ group: "cokeChoice" }] },
    { id: "mars-kombo", category: "combos", name: "Mars Kombo", price: 1495, tags: [],
      image: "assets/img/menu/mars-kombo.jpg", light: true,
      description: "Mars, малки картофки, Coca-Cola или Zero, снакс микс и сос.",
      ingredients: [{ name: "Бургер Mars" }, { name: "Малки картофки" }, { name: "Coca-Cola или Coca-Cola Zero" }, { name: "Снакс микс" }, { name: "Сос" }],
      options: [{ group: "cokeChoice" }] },
    { id: "cheeseburger-kombo", category: "combos", name: "Cheeseburger Комбо", price: 690, tags: [], badge: "Детско",
      image: "assets/img/menu/cheeseburger-kombo.jpg",
      description: "Детско комбо: малък бургер, картофки и напитка.",
      ingredients: [{ name: "Малък бургер" }, { name: "Картофки" }, { name: "Напитка" }], options: [] },
    { id: "nuggets-kombo", category: "combos", name: "Nuggets Комбо 4 бр.", price: 690, tags: [], badge: "Детско",
      image: "assets/img/menu/nuggets-kombo.jpg",
      description: "4 пилешки хапки, малки картофки и напитка по избор.",
      ingredients: [{ name: "4 × пилешка хапка" }, { name: "Малки картофки" }, { name: "Напитка по избор" }], options: [] },

    /* ---------------- СНАКС ---------------- */
    { id: "mix-box", category: "snacks", name: "Boom Mix Box + 2 бири", price: 790, tags: [], badge: "18+",
      image: "assets/img/menu/mix-box.jpg",
      description: "Картофки с чедър, кръгчета, моцарела, чили чийз и 2 студени бири. За споделяне.",
      ingredients: [{ name: "Картофки с чедър" }, { name: "Хрупкав лук" }, { name: "3 × лучено кръгче" }, { name: "2 × моцарела стик" }, { name: "2 × чили чийз" }, { name: "2 × студена бира" }], options: [] },
    { id: "nuggets-20", category: "snacks", name: "Chicken Nuggets 20 бр.", price: 915, tags: [],
      image: "assets/img/menu/nuggets-20.jpg", light: true,
      description: "Двайсет хрупкави пилешки хапки.", ingredients: [{ name: "20 × пилешка хапка" }], options: [] },
    { id: "nuggets-9", category: "snacks", name: "Chicken Nuggets 9 бр.", price: 415, tags: [],
      image: "assets/img/menu/nuggets-9.jpg", light: true,
      description: "Девет хрупкави пилешки хапки.", ingredients: [{ name: "9 × пилешка хапка" }], options: [] },
    { id: "nuggets-6", category: "snacks", name: "Chicken Nuggets 6 бр.", price: 295, tags: [],
      image: "assets/img/menu/nuggets-6.jpg", light: true,
      description: "Шест златисти пилешки хапки.", ingredients: [{ name: "6 × пилешка хапка" }], options: [] },
    { id: "chili-cheese", category: "snacks", name: "Chili Cheese", price: 390, tags: [],
      image: "assets/img/menu/chili-cheese.jpg", light: true,
      description: "Хрупкави хапки с пикантно сирене. 5 бр.", ingredients: [{ name: "5 × чили чийз" }], options: [] },
    { id: "mozzarella-sticks", category: "snacks", name: "Mozzarella Sticks", price: 390, tags: [],
      image: "assets/img/menu/mozzarella-sticks.jpg", light: true,
      description: "Хрупкави отвън, разтопени отвътре. 4 бр.", ingredients: [{ name: "4 × моцарела стик" }], options: [] },
    { id: "onion-rings", category: "snacks", name: "Onion Rings", price: 330, tags: [],
      image: "assets/img/menu/onion-rings.jpg", light: true,
      description: "Хрупкави лучени кръгчета в панировка. 5 бр.", ingredients: [{ name: "5 × лучено кръгче" }], options: [] },
    { id: "boom-fries", category: "snacks", name: "Boom Fries", price: 290, tags: [],
      image: "assets/img/menu/boom-fries.jpg",
      description: "Хрупкави, златисти и винаги вкусни.", ingredients: [{ name: "Картофки" }], options: [] },

    /* ---------------- ШЕЙКОВЕ ---------------- */
    { id: "shake-oreo", category: "shakes", name: "Lyx Shake Oreo", price: 390, tags: [],
      image: "assets/img/menu/shake-oreo.jpg", light: true,
      description: "Милкшейк с Oreo. 300 мл.", ingredients: [{ name: "Милкшейк" }, { name: "Oreo" }], options: [] },
    { id: "shake-vanilla", category: "shakes", name: "Ванилов милкшейк", price: 290, tags: [],
      image: "assets/img/menu/shake-vanilla.jpg",
      description: "Класически ванилов шейк. 300 мл.", ingredients: [{ name: "Ванилов милкшейк, 300 мл" }], options: [] },
    { id: "shake-strawberry", category: "shakes", name: "Ягодов милкшейк", price: 290, tags: [],
      image: "assets/img/menu/shake-strawberry.jpg", light: true,
      description: "Ягодов шейк. 300 мл.", ingredients: [{ name: "Ягодов милкшейк, 300 мл" }], options: [] },
    { id: "shake-chocolate", category: "shakes", name: "Шоколадов милкшейк", price: 230, tags: [],
      image: "assets/img/menu/shake-chocolate.jpg",
      description: "Шоколадов шейк. 250 мл.", ingredients: [{ name: "Шоколадов милкшейк, 250 мл" }], options: [] },

    /* ---------------- НАПИТКИ ---------------- */
    { id: "coca-cola", category: "drinks", name: "Coca-Cola", price: 188, tags: [], image: "assets/img/menu/coca-cola.jpg", light: true,
      description: "300 мл.", ingredients: [{ name: "Coca-Cola, 300 мл" }], options: [] },
    { id: "coca-cola-zero", category: "drinks", name: "Coca-Cola Zero", price: 188, tags: [], image: "assets/img/menu/coca-cola-zero.jpg",
      description: "330 мл.", ingredients: [{ name: "Coca-Cola Zero, 330 мл" }], options: [] },
    { id: "sprite", category: "drinks", name: "Sprite", price: 188, tags: [], image: "assets/img/menu/sprite.jpg", light: true,
      description: "330 мл.", ingredients: [{ name: "Sprite, 330 мл" }], options: [] },
    { id: "fanta", category: "drinks", name: "Fanta портокал", price: 168, tags: [], image: "assets/img/menu/fanta.jpg", light: true,
      description: "250 мл.", ingredients: [{ name: "Fanta портокал, 250 мл" }], options: [] },
    { id: "ice-tea", category: "drinks", name: "Студен чай ягода и лимон", price: 168, tags: [], image: "assets/img/menu/ice-tea.jpg",
      description: "250 мл.", ingredients: [{ name: "Студен чай, 250 мл" }], options: [] },
    { id: "ayran", category: "drinks", name: "Айрян", price: 168, tags: [], image: "assets/img/menu/ayran.jpg", light: true,
      description: "250 мл.", ingredients: [{ name: "Айрян, 250 мл" }], options: [] },
    { id: "cappy", category: "drinks", name: "Cappy портокал", price: 110, tags: [], image: "assets/img/menu/cappy.jpg", light: true,
      description: "Плодов сок. 220 мл.", ingredients: [{ name: "Cappy портокал, 220 мл" }], options: [] },
    { id: "water", category: "drinks", name: "Вода Банкя", price: 128, tags: [], image: "assets/img/menu/water.jpg", light: true,
      description: "500 мл.", ingredients: [{ name: "Минерална вода, 500 мл" }], options: [] },
    { id: "stella", category: "drinks", name: "Stella Artois", price: 255, tags: [], badge: "18+", image: "assets/img/menu/stella.jpg", light: true,
      description: "330 мл.", ingredients: [{ name: "Бира Stella Artois, 330 мл" }], options: [] },
    { id: "kamenitza", category: "drinks", name: "Каменица", price: 198, tags: [], badge: "18+", image: "assets/img/menu/kamenitza.jpg", light: true,
      description: "500 мл.", ingredients: [{ name: "Бира Каменица, 500 мл" }], options: [] }
  ]
};
