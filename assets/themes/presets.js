// Add presets here; all visual settings are resolved into each theme object.
(() => {
  const stops = [0, 14, 28, 43, 58, 73, 88, 100];
  function preset(id, name, colors, options = {}) {
    const defaults = {
      photo: { opacity:.33, solidCore:48, featherEnd:100, saturation:.65, sepia:0 },
      particles: { desktop:40, mobile:18, color:'#cfac68', glow:'#e6c588', opacity:1 },
      leaves: { enabled:true, maxLeaves:8, mobileMaxLeaves:3, opacity:[.30,.55], spawnIntervalMs:[5000,10000], colors:['#b89a58','#b18443','#a2653c','#a77350'] },
      decorativeLeaves: { inactive:'#92745b', active:'#D6AD69', glow:.28, opacity:.20 },
      spotlight: { tint:'207, 172, 104', intensity:.10 }
    };
    const result = { id, name, gradient:colors.map((color,i) => ({color,at:stops[i]})), accent:'#cfac68', shade:.64, grain:0, lightLeak:0, leakColor:'173, 104, 61', ...options };
    for (const key of Object.keys(defaults)) result[key] = { ...defaults[key], ...options[key] };
    return result;
  }
  window.shutterTrendThemes = [
    preset('autumn-after-dark','Autumn After Dark',['#AE7055','#7C4D52','#754A6A','#343D64','#263D62','#182D4C','#101D35','#080E1B']),
    preset('last-golden-hour','Last Golden Hour',['#AD7D42','#986538','#785037','#59402F','#3F332B','#2A2623','#191A1B','#0C1014'], { accent:'#dfbb7b', particles:{color:'#d8a44f',glow:'#f0cf8e'}, spotlight:{tint:'222, 168, 86',intensity:.12}, leaves:{colors:['#c69a50','#b7823f','#ad683e','#a56e48']} }),
    preset('midnight-maple','Midnight Maple',['#2E3553','#293151','#252B4B','#202A49','#1A2946','#14233E','#0E1930','#070D19'], { accent:'#c49570', photo:{opacity:.27,solidCore:42}, particles:{desktop:30,mobile:12,opacity:.65}, spotlight:{tint:'194, 141, 99',intensity:.07}, leaves:{maxLeaves:5,mobileMaxLeaves:2,opacity:[.28,.44],spawnIntervalMs:[8000,13000],colors:['#c69660','#ba764c'],shape:'maple'} }),
    preset('autumn-on-film','Autumn on Film',['#8B6A50','#755742','#624B3D','#4C3D35','#39332E','#272726','#191C1F','#0D1117'], { accent:'#d0b58b', photo:{sepia:.22,saturation:.55}, grain:.055,lightLeak:.10,particles:{desktop:34,mobile:14,color:'#c7a775',glow:'#e4c49a',opacity:.8},spotlight:{tint:'199, 143, 94',intensity:.10},leaves:{colors:['#b49972','#a78257','#a16c4e'],opacity:[.28,.45]} }),
    preset('blue-ridge-twilight','Blue Ridge Twilight',['#98717B','#7E657F','#665B7E','#4E5277','#394C6D','#273B58','#172A43','#0A1528'], { accent:'#d0b894',particles:{color:'#cfb580',glow:'#e2d0a9'},spotlight:{tint:'205, 180, 144',intensity:.08},leaves:{colors:['#ba805c','#b88760','#b39872']} }),
    preset('floating-autumn','Floating Autumn',['#895B48','#704D48','#5A4052','#3F3D5C','#2E3B58','#1E304C','#12223B','#090F20'], { photo:{opacity:.20,solidCore:35},particles:{desktop:48,mobile:22,opacity:.95},leaves:{maxLeaves:8,mobileMaxLeaves:3,spawnIntervalMs:[5000,8000],colors:['#c29c5e','#bb824e','#a96e45'],opacity:[.33,.55]},spotlight:{tint:'207, 157, 103',intensity:.11} })
  ];
})();
