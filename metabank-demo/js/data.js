window.MetaBankSeed = {
  profile: {name:'آرمان رضایی',mobile:'۰۹۱۲۱۲۳۴۵۶۷',email:'arman@example.com',national:'۰۰۱۲۳۴۵۶۷۸'},
  assets:[
    {id:'irr-main',name:'حساب جاری',symbol:'IRR',kind:'bank',balance:128500000,network:'بانکی',address:'IR000000000000000000007890',suffix:'۷۸۹۰',color:'blue',rate:1},
    {id:'irr-save',name:'حساب پس‌انداز',symbol:'IRR',kind:'bank',balance:45000000,network:'بانکی',address:'IR000000000000000000002614',suffix:'۲۶۱۴',color:'gold',rate:1},
    {id:'btc',name:'بیت‌کوین',symbol:'BTC',kind:'crypto',balance:.012,network:'Bitcoin',address:'bc1q-demo-only-not-a-real-address',color:'black',rate:100000000000},
    {id:'usdt',name:'تتر',symbol:'USDT',kind:'crypto',balance:1250,network:'Tron',address:'T-DEMO-ONLY-NOT-A-REAL-ADDRESS',color:'blue',rate:1000000},
    {id:'eth',name:'اتر',symbol:'ETH',kind:'crypto',balance:.35,network:'Ethereum',address:'0xDEMO-ONLY-NOT-A-REAL-ADDRESS',color:'red',rate:3000000000},
    {id:'rwa',name:'صندوق املاک نمونه',symbol:'RWA',kind:'token',balance:250,network:'RAAKH · نمونه',address:'توکن پروژهٔ نمونه',color:'gold',rate:1000000}
  ],
  cards:[{id:'card1',name:'کارت روزمره',owner:'آرمان رضایی',suffix:'۴۸۲۱',expiry:'۰۸/۲۹',account:'irr-main',color:'blue',active:true,limit:50000000},{id:'card2',name:'کارت خرید مجازی',owner:'آرمان رضایی',suffix:'۹۱۳۵',expiry:'۰۳/۳۰',account:'irr-save',color:'gold',active:true,limit:20000000},{id:'card3',name:'کارت سفر',owner:'آرمان رضایی',suffix:'۶۳۲۸',expiry:'۱۱/۲۹',account:'irr-main',color:'black',active:false,limit:10000000}],
  transactions:[
    {id:'MB-104829',title:'خرید فروشگاهی',type:'bank',asset:'irr-main',amount:-2480000,date:'۱۴۰۵/۰۸/۱۳',time:'۱۰:۲۴',party:'فروشگاه شهروند',network:'بانکی',status:'موفق',fee:0},
    {id:'MB-104828',title:'واریز حقوق',type:'bank',asset:'irr-main',amount:35000000,date:'۱۴۰۵/۰۸/۱۲',time:'۰۹:۱۵',party:'شرکت نمونه',network:'بانکی',status:'موفق',fee:0},
    {id:'MB-104827',title:'انتقال به سارا',type:'bank',asset:'irr-main',amount:-5000000,date:'۱۴۰۵/۰۸/۱۲',time:'۱۲:۱۰',party:'سارا محمدی',network:'بانکی',status:'موفق',fee:10000},
    {id:'MB-104826',title:'دریافت تتر',type:'crypto',asset:'usdt',amount:250,date:'۱۴۰۵/۰۸/۱۱',time:'۱۴:۳۲',party:'علی کریمی',network:'Tron',status:'تأییدشده',fee:0},
    {id:'MB-104825',title:'خرید بیت‌کوین',type:'market',asset:'btc',amount:.002,date:'۱۴۰۵/۰۸/۱۱',time:'۱۱:۰۲',party:'بازار متابانک',network:'داخلی',status:'تکمیل‌شده',fee:0},
    {id:'MB-104824',title:'خرید واحد صندوق',type:'token',asset:'rwa',amount:50,date:'۱۴۰۵/۰۸/۱۰',time:'۱۶:۴۵',party:'صندوق املاک نمونه',network:'RAAKH · نمونه',status:'تکمیل‌شده',fee:0}
  ],
  contacts:[{id:'c1',name:'سارا محمدی',handle:'@sara',destinations:[{type:'bank',label:'کارت روزمره',value:'۶۲۱۹ •••• •••• ۶۳۲۱'},{type:'bank',label:'شبا',value:'IR000000000000000000000058'}]},{id:'c2',name:'علی کریمی',handle:'@ali',destinations:[{type:'crypto',label:'USDT · Tron',value:'T-DEMO-ALI-NOT-REAL'}]},{id:'c3',name:'شرکت نمونه',handle:'@example',destinations:[{type:'bank',label:'شبا',value:'IR000000000000000000000072'},{type:'crypto',label:'ETH · Ethereum',value:'0xDEMO-COMPANY-NOT-REAL'}]}],
  notifications:[{id:'n1',title:'حقوق این ماه واریز شد',detail:'۳۵٬۰۰۰٬۰۰۰ ریال به حساب جاری',kind:'bank',read:false},{id:'n2',title:'تتر دریافت شد',detail:'۲۵۰ USDT در شبکهٔ Tron',kind:'crypto',read:false},{id:'n3',title:'پروندهٔ وثیقه آمادهٔ بررسی است',detail:'توکن صندوق املاک نمونه',kind:'token',read:false},{id:'n4',title:'ورود به محیط نمایشی',detail:'اطلاعات این محیط نمونه است.',kind:'system',read:true}],
  requests:[{id:'TF-1001',name:'صندوق املاک نمونه',symbol:'HOME',supply:1000000,kind:'توکن دارایی',status:'پیش‌نویس',description:'نمونهٔ انتشار توکن با پشتوانهٔ دارایی'}],
  businessPayments:[{id:'INV-1042',title:'فاکتور خدمات',amount:25000000,status:'در انتظار پرداخت',type:'لینک پرداخت'},{id:'PAY-1041',title:'حقوق کارکنان',amount:90000000,status:'در انتظار تأیید',type:'پرداخت گروهی'},{id:'SET-1040',title:'تسویه فروشگاه',amount:46000000,status:'تسویه‌شده',type:'تسویه'}],
  settings:{currency:'IRR',language:'fa',theme:'light',sound:false,showBalance:true},
  tools:[
    {name:'TokenShop',description:'ساخت سریع توکن؛ ابزار مستقل',category:'توکن‌سازی',url:'https://soheil.info/tokenshop/'},
    {name:'TokenFactory',description:'ثبت درخواست و بررسی انتشار توکن',category:'توکن‌سازی',url:'https://soheil.info/tokenfactory/'},
    {name:'NFTShop',description:'مینت NFT روی قرارداد موجود',category:'توکن‌سازی',url:'https://soheil.info/nftshop/'},
    {name:'P2P DEX',description:'رابط معاملات مستقیم روی RAAKH',category:'بازار',url:'https://soheil.info/p2pdex/'},
    {name:'RAAKH Explorer',description:'جست‌وجوی آدرس، تراکنش و بلاک',category:'شبکه',url:'https://soheil.info/explorer/'},
    {name:'WEVM',description:'انتخاب شبکه و مرور بلاک‌های EVM',category:'شبکه',url:'https://soheil.info/wevm/'},
    {name:'SeedKit / Steellet',description:'چیدمان و بازیابی فیزیکی سید؛ ابزار مستقل',category:'نگهداری',url:'https://soheil.info/seedkit/'},
    {name:'CID Chat',description:'رابط ارتباط و مخاطبان مبتنی بر کیف پول',category:'ارتباط',url:'https://soheil.info/cid/'},
    {name:'CMX',description:'ویرایشگر محتوای تصویری روی زنجیره',category:'محتوا',url:'https://soheil.info/cmx/'},
    {name:'Tokenomist Timestamp',description:'مبدل زمان، تقویم و نشان زمان',category:'ابزار',url:'https://soheil.info/time/'},
    {name:'RPCNode',description:'معرفی زیرساخت RPC و Chain VAS؛ API اعلام‌شده هنوز عمومی نیست',category:'زیرساخت',url:'http://rpcnode.ir/'},
    {name:'RialChange',description:'مشاهدهٔ وب‌سایت صرافی؛ سرویس مستقل',category:'بازار',url:'https://rialchange.com/'}
  ]
};
