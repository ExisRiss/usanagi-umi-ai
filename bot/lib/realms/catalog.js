// Original Eclipse Realms content. Currency and progression reuse Usanagi RPG.
export const REALM_NAME = 'Eclipse Realms'
export const CLASSES = {
 warrior:{name:'Warrior',skill:'Shieldbreaker',mana:14,multiplier:1.8,defense:5,color:'#d7aa66'},
 mage:{name:'Mage',skill:'Emberfall',mana:22,multiplier:2.6,defense:0,color:'#afa1ef'},
 archer:{name:'Archer',skill:'Piercing arrow',mana:16,multiplier:2,defense:2,color:'#8bc795'},
 assassin:{name:'Assassin',skill:'Shadow strike',mana:18,multiplier:2.2,defense:1,color:'#d48da4'},
}
export const NPCS = [
 {id:'elder',name:'Elder Rowan',role:'Penjaga desa · Quest',x:30,y:50},
 {id:'merchant',name:'Mira',role:'Potion & equipment',x:22,y:50},
 {id:'healer',name:'Sister Elia',role:'Pemulihan · Safe zone',x:40,y:42},
 {id:'petkeeper',name:'Faelan',role:'Pet summoning',x:34,y:73},
]
export const MONSTERS = {
 slime:{name:'Moss Slime',x:62,y:48,hp:32,attack:7,defense:1,exp:140,gold:90,loot:'herb',color:'#94ca73'},
 wolf:{name:'Briar Wolf',x:75,y:35,hp:66,attack:12,defense:3,exp:260,gold:180,loot:'meat',color:'#b1c2c6'},
 goblin:{name:'Ruin Goblin',x:86,y:43,hp:92,attack:16,defense:5,exp:400,gold:250,loot:'iron',color:'#aab460'},
 sentinel:{name:'Ancient Sentinel',x:84,y:26,hp:230,attack:23,defense:7,exp:1200,gold:700,loot:'diamond',color:'#91d3d6',boss:true},
}
export const SHOP = {
 potion:{name:'Health Potion',buy:500,sell:0,kind:'consumable',desc:'Pulihkan 45 HP.'},
 mpotion:{name:'Mana Potion',buy:500,sell:0,kind:'consumable',desc:'Pulihkan 45 MP.'},
 herb:{name:'Forest Herb',buy:150,sell:30,kind:'material',desc:'Herba hutan untuk alkimia.'},
 meat:{name:'Meat',buy:300,sell:60,kind:'material',desc:'Makanan pet dari perburuan.'},
 iron:{name:'Iron Ore',buy:0,sell:200,kind:'material',desc:'Material besi untuk blacksmith.'},
 diamond:{name:'Diamond',buy:0,sell:5000,kind:'material',desc:'Batu berharga dari sentinel.'},
 realm_blade:{name:'Dawnsteel Blade',buy:1200,sell:240,kind:'weapon',attack:5,desc:'Senjata adventurer · ATK +5.'},
 realm_armor:{name:'Wayfarer Armor',buy:1500,sell:300,kind:'armor',defense:4,desc:'Armor perjalanan · DEF +4.'},
}
// Types intentionally match the existing pet commands, including evolved species.
export const PETS = [
 {type:'cat',name:'Moon Cat',rarity:'Common',weight:40,stats:{attack:5,defense:3,luck:5}},
 {type:'rabbit',name:'Moss Rabbit',rarity:'Uncommon',weight:30,stats:{attack:3,defense:4,luck:6}},
 {type:'dog',name:'Ember Hound',rarity:'Rare',weight:20,stats:{attack:8,defense:5,luck:2}},
 {type:'bird',name:'Dawn Finch',rarity:'Epic',weight:8,stats:{attack:4,defense:2,luck:8}},
 {type:'dragon',name:'Azure Wyrm',rarity:'Legendary',weight:2,stats:{attack:20,defense:15,luck:12}},
]
export const QUEST = {id:'first-light',name:'Cahaya di Greenleaf',description:'Temui Elder Rowan, kalahkan 3 Moss Slime, lalu kembali ke desa.',target:3,gold:600,exp:600,tokens:1}
export const EXP_PER_LEVEL=10000
export const WORLD={width:100,height:100,minX:9,maxX:93,minY:23,maxY:77,forestX:52}

export const WALKABLE=[[20,35,43,59],[31,55,39,77],[40,43,94,53],[64,23,93,47]]
export const canWalk=(x,y,region='greenleaf')=>(REGIONS[region]?.walkable||[]).some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d)

export const REGIONS = {
 greenleaf:{name:'Greenleaf',description:'Desa pemula, hutan perburuan dan gerbang reruntuhan.',art:'/realms/world.webp',safe:false,walkable:WALKABLE},
 kingdom:{name:'Royal Capital',description:'Ibu kota kerajaan: komisi penjaga, pasar, healer dan summoning hall.',art:'/realms/kingdom.webp',safe:true,walkable:[[14,42,89,61],[43,24,59,78]]},
 dungeon:{name:'Hollow Crypt',description:'Dungeon solo tersimpan: dua penjaga, boss dan peti hadiah. Tidak bercampur dengan instance pemain lain.',art:'/realms/dungeon.webp',safe:false,walkable:[[12,43,89,58],[12,43,27,77],[72,24,89,58]]},
}
export const PORTALS = [
 {id:'capital-road',region:'greenleaf',name:'Jalan ke Royal Capital',x:45,y:50,to:'kingdom',spawn:{x:20,y:50}},
 {id:'crypt-stairs',region:'greenleaf',name:'Tangga Hollow Crypt',x:84,y:26,to:'dungeon',spawn:{x:18,y:68}},
 {id:'capital-return',region:'kingdom',name:'Gerbang Greenleaf',x:18,y:50,to:'greenleaf',spawn:{x:45,y:50}},
 {id:'crypt-return',region:'dungeon',name:'Keluar dari crypt',x:18,y:68,to:'greenleaf',spawn:{x:84,y:29}},
]
NPCS.push(
 {id:'royal',region:'kingdom',name:'Captain Edrin',role:'Komisi kerajaan · Quest',x:50,y:32},
 {id:'royalmerchant',region:'kingdom',service:'merchant',name:'Bram the Smith',role:'Equipment & provisions',x:30,y:50},
 {id:'royalhealer',region:'kingdom',service:'healer',name:'Royal Apothecary',role:'Pemulihan · Safe zone',x:56,y:53},
 {id:'royalpetkeeper',region:'kingdom',service:'petkeeper',name:'Summoner Aelia',role:'Pet summoning hall',x:73,y:50},
)
Object.assign(MONSTERS,{
 cryptguard:{region:'dungeon',name:'Crypt Guardian',x:42,y:50,hp:52,attack:10,defense:2,exp:180,gold:100,loot:'iron',color:'#939fa4'},
 runebat:{region:'dungeon',name:'Runebat',x:62,y:50,hp:44,attack:11,defense:1,exp:180,gold:100,loot:'herb',color:'#c4a0d4'},
 hollowking:{region:'dungeon',name:'The Hollow King',x:80,y:35,hp:110,attack:12,defense:2,exp:450,gold:250,loot:'diamond',color:'#9bd9cf',boss:true},
})
export const DUNGEON={name:'Trial of the Hollow',sequence:['cryptguard','runebat','hollowking'],reward:{gold:1000,exp:500,tokens:1},cooldown:600000}
export const ROYAL_QUEST={name:'The King’s Commission',target:2,gold:600,exp:400,tokens:1}

// Shared interaction/cadence rules. Client requests intent; server owns outcomes.
export const COMBAT = {playerCooldownMs:550,enemyIntervalMs:2200,encounterRange:15,npcRange:13,aggroRange:6,respawnMs:2500}
export const NPC_DIALOGUE = {
 elder:'Selamat datang, petualang. Moss Slime mengganggu hutan. Ambil quest, kalahkan tiga slime, lalu kembali kepadaku.',
 merchant:'Selamat datang di tokoku. Kamu bisa membeli potion dan equipment, atau menjual hasil petualangan.',
 healer:'Beristirahatlah sejenak. Aku bisa memulihkan HP dan mana agar kamu siap kembali bertualang.',
 petkeeper:'Companion akan menemanimu. Gunakan summon token, lalu pilih pet yang ingin kamu ajak bertualang.',
 royal:'Kerajaan membutuhkan bantuanmu. Kalahkan dua Briar Wolf di Greenleaf dan kembali untuk menerima komisi.',
}
