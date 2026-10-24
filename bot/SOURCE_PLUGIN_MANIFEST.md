# Usanagi Plugin Migration Manifest

All 343 Usanagi Umi AI plugins were migrated into Usanagi Umi AI v7.1.

- 3 AI plugins were adapted to the AlzRiss runtime.
- 340 remaining plugins were copied with the `usanagi-` filename prefix.
- Use `.usanagi-<command>` when a command conflicts with an existing plugin.
- `tools/rvo.js` is present but disabled for privacy.

## ai (3)

- `ai/deepseek.js` → `plugins/ai/ai-deepseek-pro.js (adapted)`
- `ai/grok.js` → `plugins/ai/ai-groq-pro.js (adapted)`
- `ai/usanagi.js` → `plugins/ai/ai-usanagi.js (adapted)`

## anime (10)

- `anime/airing-board.js` → `plugins/anime/usanagi-airing-board.js`
- `anime/anime-profile.js` → `plugins/anime/usanagi-anime-profile.js`
- `anime/anime-quotes.js` → `plugins/anime/usanagi-anime-quotes.js`
- `anime/comic-reader.js` → `plugins/anime/usanagi-comic-reader.js`
- `anime/otaku-catalog.js` → `plugins/anime/usanagi-otaku-catalog.js`
- `anime/random-anime-image.js` → `plugins/anime/usanagi-random-anime-image.js`
- `anime/random-anime.js` → `plugins/anime/usanagi-random-anime.js`
- `anime/random-blue.js` → `plugins/anime/usanagi-random-blue.js`
- `anime/random-image-safe.js` → `plugins/anime/usanagi-random-image-safe.js`
- `anime/random-story.js` → `plugins/anime/usanagi-random-story.js`

## download (12)

- `download/aio.js` → `plugins/download/usanagi-aio.js`
- `download/Facebook.js` → `plugins/download/usanagi-Facebook.js`
- `download/instagram.js` → `plugins/download/usanagi-instagram.js`
- `download/mediafire.js` → `plugins/download/usanagi-mediafire.js`
- `download/pindl.js` → `plugins/download/usanagi-pindl.js`
- `download/play.js` → `plugins/download/usanagi-play.js`
- `download/play2.js` → `plugins/download/usanagi-play2.js`
- `download/soundcloud.js` → `plugins/download/usanagi-soundcloud.js`
- `download/tiktok.js` → `plugins/download/usanagi-tiktok.js`
- `download/videy.js` → `plugins/download/usanagi-videy.js`
- `download/ytmp3.js` → `plugins/download/usanagi-ytmp3.js`
- `download/ytmp4.js` → `plugins/download/usanagi-ytmp4.js`

## fun (86)

- `fun/akankah.js` → `plugins/fun/usanagi-akankah.js`
- `fun/angka.js` → `plugins/fun/usanagi-angka.js`
- `fun/apakah.js` → `plugins/fun/usanagi-apakah.js`
- `fun/bagaimana.js` → `plugins/fun/usanagi-bagaimana.js`
- `fun/berapa.js` → `plugins/fun/usanagi-berapa.js`
- `fun/bisakah.js` → `plugins/fun/usanagi-bisakah.js`
- `fun/bucin.js` → `plugins/fun/usanagi-bucin.js`
- `fun/carabalikan.js` → `plugins/fun/usanagi-carabalikan.js`
- `fun/cekbaik.js` → `plugins/fun/usanagi-cekbaik.js`
- `fun/cekberat.js` → `plugins/fun/usanagi-cekberat.js`
- `fun/cekbucin.js` → `plugins/fun/usanagi-cekbucin.js`
- `fun/cekcantik.js` → `plugins/fun/usanagi-cekcantik.js`
- `fun/cekcreative.js` → `plugins/fun/usanagi-cekcreative.js`
- `fun/cekcupu.js` → `plugins/fun/usanagi-cekcupu.js`
- `fun/cekfemboy.js` → `plugins/fun/usanagi-cekfemboy.js`
- `fun/cekgabut.js` → `plugins/fun/usanagi-cekgabut.js`
- `fun/cekgacha.js` → `plugins/fun/usanagi-cekgacha.js`
- `fun/cekgamer.js` → `plugins/fun/usanagi-cekgamer.js`
- `fun/cekganteng.js` → `plugins/fun/usanagi-cekganteng.js`
- `fun/cekgila.js` → `plugins/fun/usanagi-cekgila.js`
- `fun/cekhoki.js` → `plugins/fun/usanagi-cekhoki.js`
- `fun/cekimut.js` → `plugins/fun/usanagi-cekimut.js`
- `fun/cekintrovert.js` → `plugins/fun/usanagi-cekintrovert.js`
- `fun/cekiq.js` → `plugins/fun/usanagi-cekiq.js`
- `fun/cekjahat.js` → `plugins/fun/usanagi-cekjahat.js`
- `fun/cekjodoh.js` → `plugins/fun/usanagi-cekjodoh.js`
- `fun/cekjomblo.js` → `plugins/fun/usanagi-cekjomblo.js`
- `fun/cekkarma.js` → `plugins/fun/usanagi-cekkarma.js`
- `fun/cekkaya.js` → `plugins/fun/usanagi-cekkaya.js`
- `fun/cekkece.js` → `plugins/fun/usanagi-cekkece.js`
- `fun/cekkepribadian.js` → `plugins/fun/usanagi-cekkepribadian.js`
- `fun/cekkhodam.js` → `plugins/fun/usanagi-cekkhodam.js`
- `fun/cekkpopers.js` → `plugins/fun/usanagi-cekkpopers.js`
- `fun/ceklapar.js` → `plugins/fun/usanagi-ceklapar.js`
- `fun/cekmalas.js` → `plugins/fun/usanagi-cekmalas.js`
- `fun/cekmesum.js` → `plugins/fun/usanagi-cekmesum.js`
- `fun/cekngantuk.js` → `plugins/fun/usanagi-cekngantuk.js`
- `fun/cekotaku.js` → `plugins/fun/usanagi-cekotaku.js`
- `fun/cekoverpower.js` → `plugins/fun/usanagi-cekoverpower.js`
- `fun/cekpacar.js` → `plugins/fun/usanagi-cekpacar.js`
- `fun/cekpartner.js` → `plugins/fun/usanagi-cekpartner.js`
- `fun/cekpelit.js` → `plugins/fun/usanagi-cekpelit.js`
- `fun/cekpintar.js` → `plugins/fun/usanagi-cekpintar.js`
- `fun/cekprocastinator.js` → `plugins/fun/usanagi-cekprocastinator.js`
- `fun/cekpsikopat.js` → `plugins/fun/usanagi-cekpsikopat.js`
- `fun/cekrezeki.js` → `plugins/fun/usanagi-cekrezeki.js`
- `fun/ceksabar.js` → `plugins/fun/usanagi-ceksabar.js`
- `fun/ceksetia.js` → `plugins/fun/usanagi-ceksetia.js`
- `fun/ceksexy.js` → `plugins/fun/usanagi-ceksexy.js`
- `fun/ceksial.js` → `plugins/fun/usanagi-ceksial.js`
- `fun/ceksifat.js` → `plugins/fun/usanagi-ceksifat.js`
- `fun/ceksisaumur.js` → `plugins/fun/usanagi-ceksisaumur.js`
- `fun/ceksocmed.js` → `plugins/fun/usanagi-ceksocmed.js`
- `fun/cektinggi.js` → `plugins/fun/usanagi-cektinggi.js`
- `fun/cektsundere.js` → `plugins/fun/usanagi-cektsundere.js`
- `fun/cektt.js` → `plugins/fun/usanagi-cektt.js`
- `fun/cekumur.js` → `plugins/fun/usanagi-cekumur.js`
- `fun/cekwibu.js` → `plugins/fun/usanagi-cekwibu.js`
- `fun/cekyandere.js` → `plugins/fun/usanagi-cekyandere.js`
- `fun/coba.js` → `plugins/fun/usanagi-coba.js`
- `fun/dare.js` → `plugins/fun/usanagi-dare.js`
- `fun/diamakah.js` → `plugins/fun/usanagi-diamakah.js`
- `fun/dimana.js` → `plugins/fun/usanagi-dimana.js`
- `fun/fuckmylife.js` → `plugins/fun/usanagi-fuckmylife.js`
- `fun/gay.js` → `plugins/fun/usanagi-gay.js`
- `fun/haruskah.js` → `plugins/fun/usanagi-haruskah.js`
- `fun/jadian.js` → `plugins/fun/usanagi-jadian.js`
- `fun/jodoh.js` → `plugins/fun/usanagi-jodoh.js`
- `fun/kapan.js` → `plugins/fun/usanagi-kapan.js`
- `fun/mengapa.js` → `plugins/fun/usanagi-mengapa.js`
- `fun/mimpi.js` → `plugins/fun/usanagi-mimpi.js`
- `fun/puisi.js` → `plugins/fun/usanagi-puisi.js`
- `fun/putus.js` → `plugins/fun/usanagi-putus.js`
- `fun/quotesad.js` → `plugins/fun/usanagi-quotesad.js`
- `fun/rate.js` → `plugins/fun/usanagi-rate.js`
- `fun/renungan.js` → `plugins/fun/usanagi-renungan.js`
- `fun/senja.js` → `plugins/fun/usanagi-senja.js`
- `fun/siapa.js` → `plugins/fun/usanagi-siapa.js`
- `fun/soulmatch.js` → `plugins/fun/usanagi-soulmatch.js`
- `fun/stress.js` → `plugins/fun/usanagi-stress.js`
- `fun/sulap.js` → `plugins/fun/usanagi-sulap.js`
- `fun/tembak.js` → `plugins/fun/usanagi-tembak.js`
- `fun/terima.js` → `plugins/fun/usanagi-terima.js`
- `fun/tolak.js` → `plugins/fun/usanagi-tolak.js`
- `fun/top.js` → `plugins/fun/usanagi-top.js`
- `fun/truth.js` → `plugins/fun/usanagi-truth.js`

## game (19)

- `game/blockblast.js` → `plugins/game/usanagi-blockblast.js`
- `game/bmxboy.js` → `plugins/game/usanagi-bmxboy.js`
- `game/chess.js` → `plugins/game/usanagi-chess.js`
- `game/dino.js` → `plugins/game/usanagi-dino.js`
- `game/doge.js` → `plugins/game/usanagi-doge.js`
- `game/fishing.js` → `plugins/game/usanagi-fishing.js`
- `game/fruitslot.js` → `plugins/game/usanagi-fruitslot.js`
- `game/ghost.js` → `plugins/game/usanagi-ghost.js`
- `game/hillracer.js` → `plugins/game/usanagi-hillracer.js`
- `game/ludo.js` → `plugins/game/usanagi-ludo.js`
- `game/racing.js` → `plugins/game/usanagi-racing.js`
- `game/skyraiders.js` → `plugins/game/usanagi-skyraiders.js`
- `game/slot2.js` → `plugins/game/usanagi-slot2.js`
- `game/snake.js` → `plugins/game/usanagi-snake.js`
- `game/sonik.js` → `plugins/game/usanagi-sonik.js`
- `game/tebakgambar.js` → `plugins/game/usanagi-tebakgambar.js`
- `game/tetris.js` → `plugins/game/usanagi-tetris.js`
- `game/tictactoe.js` → `plugins/game/usanagi-tictactoe.js`
- `game/tts.js` → `plugins/game/usanagi-tts.js`

## group (14)

- `group/afk.js` → `plugins/group/usanagi-afk.js`
- `group/antilink.js` → `plugins/group/usanagi-antilink.js`
- `group/antiswgc.js` → `plugins/group/usanagi-antiswgc.js`
- `group/antitagsw.js` → `plugins/group/usanagi-antitagsw.js`
- `group/banchat.js` → `plugins/group/usanagi-banchat.js`
- `group/goodbye.js` → `plugins/group/usanagi-goodbye.js`
- `group/groupcontrol.js` → `plugins/group/usanagi-groupcontrol.js`
- `group/groupinfo.js` → `plugins/group/usanagi-groupinfo.js`
- `group/hidetag.js` → `plugins/group/usanagi-hidetag.js`
- `group/resetgoodbye.js` → `plugins/group/usanagi-resetgoodbye.js`
- `group/resetwelcome.js` → `plugins/group/usanagi-resetwelcome.js`
- `group/setgoodbye.js` → `plugins/group/usanagi-setgoodbye.js`
- `group/setwelcome.js` → `plugins/group/usanagi-setwelcome.js`
- `group/welcome.js` → `plugins/group/usanagi-welcome.js`

## main (9)

- `main/allmenu.js` → `plugins/main/usanagi-allmenu.js`
- `main/donasi.js` → `plugins/main/usanagi-donasi.js`
- `main/kategori.js` → `plugins/main/usanagi-kategori.js`
- `main/menu.js` → `plugins/main/usanagi-menu.js`
- `main/peraturan.js` → `plugins/main/usanagi-peraturan.js`
- `main/ping.js` → `plugins/main/usanagi-ping.js`
- `main/ping2.js` → `plugins/main/usanagi-ping2.js`
- `main/ping3.js` → `plugins/main/usanagi-ping3.js`
- `main/totalfitur.js` → `plugins/main/usanagi-totalfitur.js`

## owner (11)

- `owner/addowner.js` → `plugins/owner/usanagi-addowner.js`
- `owner/anticall.js` → `plugins/owner/usanagi-anticall.js`
- `owner/backup.js` → `plugins/owner/usanagi-backup.js`
- `owner/broadcast.js` → `plugins/owner/usanagi-broadcast.js`
- `owner/delowner.js` → `plugins/owner/usanagi-delowner.js`
- `owner/onlygc.js` → `plugins/owner/usanagi-onlygc.js`
- `owner/onlypc.js` → `plugins/owner/usanagi-onlypc.js`
- `owner/owner.js` → `plugins/owner/usanagi-owner.js`
- `owner/setmenu.js` → `plugins/owner/usanagi-setmenu.js`
- `owner/setprefix.js` → `plugins/owner/usanagi-setprefix.js`
- `owner/setreply.js` → `plugins/owner/usanagi-setreply.js`

## rpg (152)

- `rpg/achievement.js` → `plugins/rpg/usanagi-achievement.js`
- `rpg/adventure.js` → `plugins/rpg/usanagi-adventure.js`
- `rpg/alchemy.js` → `plugins/rpg/usanagi-alchemy.js`
- `rpg/archaeology.js` → `plugins/rpg/usanagi-archaeology.js`
- `rpg/arena.js` → `plugins/rpg/usanagi-arena.js`
- `rpg/artifactforge.js` → `plugins/rpg/usanagi-artifactforge.js`
- `rpg/ascension.js` → `plugins/rpg/usanagi-ascension.js`
- `rpg/auction.js` → `plugins/rpg/usanagi-auction.js`
- `rpg/baitshop.js` → `plugins/rpg/usanagi-baitshop.js`
- `rpg/bank.js` → `plugins/rpg/usanagi-bank.js`
- `rpg/beg.js` → `plugins/rpg/usanagi-beg.js`
- `rpg/berburu.js` → `plugins/rpg/usanagi-berburu.js`
- `rpg/berladang.js` → `plugins/rpg/usanagi-berladang.js`
- `rpg/bid.js` → `plugins/rpg/usanagi-bid.js`
- `rpg/blacksmith.js` → `plugins/rpg/usanagi-blacksmith.js`
- `rpg/blueprint.js` → `plugins/rpg/usanagi-blueprint.js`
- `rpg/boss.js` → `plugins/rpg/usanagi-boss.js`
- `rpg/bossrush.js` → `plugins/rpg/usanagi-bossrush.js`
- `rpg/bountyboard.js` → `plugins/rpg/usanagi-bountyboard.js`
- `rpg/bountyclaim.js` → `plugins/rpg/usanagi-bountyclaim.js`
- `rpg/breeding.js` → `plugins/rpg/usanagi-breeding.js`
- `rpg/buykoin.js` → `plugins/rpg/usanagi-buykoin.js`
- `rpg/campfire.js` → `plugins/rpg/usanagi-campfire.js`
- `rpg/casino.js` → `plugins/rpg/usanagi-casino.js`
- `rpg/challenge.js` → `plugins/rpg/usanagi-challenge.js`
- `rpg/codex.js` → `plugins/rpg/usanagi-codex.js`
- `rpg/coinflip.js` → `plugins/rpg/usanagi-coinflip.js`
- `rpg/collection.js` → `plugins/rpg/usanagi-collection.js`
- `rpg/colosseum.js` → `plugins/rpg/usanagi-colosseum.js`
- `rpg/cook.js` → `plugins/rpg/usanagi-cook.js`
- `rpg/cooking.js` → `plugins/rpg/usanagi-cooking.js`
- `rpg/craft.js` → `plugins/rpg/usanagi-craft.js`
- `rpg/crime.js` → `plugins/rpg/usanagi-crime.js`
- `rpg/daily.js` → `plugins/rpg/usanagi-daily.js`
- `rpg/dice.js` → `plugins/rpg/usanagi-dice.js`
- `rpg/dismantle.js` → `plugins/rpg/usanagi-dismantle.js`
- `rpg/divorce.js` → `plugins/rpg/usanagi-divorce.js`
- `rpg/duel.js` → `plugins/rpg/usanagi-duel.js`
- `rpg/dungeonkey.js` → `plugins/rpg/usanagi-dungeonkey.js`
- `rpg/dungeonrun.js` → `plugins/rpg/usanagi-dungeonrun.js`
- `rpg/enchant.js` → `plugins/rpg/usanagi-enchant.js`
- `rpg/eventboard.js` → `plugins/rpg/usanagi-eventboard.js`
- `rpg/eventjoin.js` → `plugins/rpg/usanagi-eventjoin.js`
- `rpg/eventredeem.js` → `plugins/rpg/usanagi-eventredeem.js`
- `rpg/eventscore.js` → `plugins/rpg/usanagi-eventscore.js`
- `rpg/expedition.js` → `plugins/rpg/usanagi-expedition.js`
- `rpg/expeditionlog.js` → `plugins/rpg/usanagi-expeditionlog.js`
- `rpg/fertilizer.js` → `plugins/rpg/usanagi-fertilizer.js`
- `rpg/festival.js` → `plugins/rpg/usanagi-festival.js`
- `rpg/fishing.js` → `plugins/rpg/usanagi-fishing.js`
- `rpg/freelance.js` → `plugins/rpg/usanagi-freelance.js`
- `rpg/friendship.js` → `plugins/rpg/usanagi-friendship.js`
- `rpg/furnish.js` → `plugins/rpg/usanagi-furnish.js`
- `rpg/garden.js` → `plugins/rpg/usanagi-garden.js`
- `rpg/gauntlet.js` → `plugins/rpg/usanagi-gauntlet.js`
- `rpg/gift.js` → `plugins/rpg/usanagi-gift.js`
- `rpg/giftnpc.js` → `plugins/rpg/usanagi-giftnpc.js`
- `rpg/guild.js` → `plugins/rpg/usanagi-guild.js`
- `rpg/heal.js` → `plugins/rpg/usanagi-heal.js`
- `rpg/hourly.js` → `plugins/rpg/usanagi-hourly.js`
- `rpg/house.js` → `plugins/rpg/usanagi-house.js`
- `rpg/hunt.js` → `plugins/rpg/usanagi-hunt.js`
- `rpg/inn.js` → `plugins/rpg/usanagi-inn.js`
- `rpg/insurance.js` → `plugins/rpg/usanagi-insurance.js`
- `rpg/inventory.js` → `plugins/rpg/usanagi-inventory.js`
- `rpg/irrigate.js` → `plugins/rpg/usanagi-irrigate.js`
- `rpg/journal.js` → `plugins/rpg/usanagi-journal.js`
- `rpg/jualan.js` → `plugins/rpg/usanagi-jualan.js`
- `rpg/kurir.js` → `plugins/rpg/usanagi-kurir.js`
- `rpg/landmark.js` → `plugins/rpg/usanagi-landmark.js`
- `rpg/leaderboard.js` → `plugins/rpg/usanagi-leaderboard.js`
- `rpg/leveluprpg.js` → `plugins/rpg/usanagi-leveluprpg.js`
- `rpg/library.js` → `plugins/rpg/usanagi-library.js`
- `rpg/loan.js` → `plugins/rpg/usanagi-loan.js`
- `rpg/lottery.js` → `plugins/rpg/usanagi-lottery.js`
- `rpg/maling.js` → `plugins/rpg/usanagi-maling.js`
- `rpg/market.js` → `plugins/rpg/usanagi-market.js`
- `rpg/marry.js` → `plugins/rpg/usanagi-marry.js`
- `rpg/meditation.js` → `plugins/rpg/usanagi-meditation.js`
- `rpg/merchant.js` → `plugins/rpg/usanagi-merchant.js`
- `rpg/merchantroute.js` → `plugins/rpg/usanagi-merchantroute.js`
- `rpg/milestone.js` → `plugins/rpg/usanagi-milestone.js`
- `rpg/milk.js` → `plugins/rpg/usanagi-milk.js`
- `rpg/mill.js` → `plugins/rpg/usanagi-mill.js`
- `rpg/mining.js` → `plugins/rpg/usanagi-mining.js`
- `rpg/mulung.js` → `plugins/rpg/usanagi-mulung.js`
- `rpg/museum.js` → `plugins/rpg/usanagi-museum.js`
- `rpg/nambalban.js` → `plugins/rpg/usanagi-nambalban.js`
- `rpg/ngamen.js` → `plugins/rpg/usanagi-ngamen.js`
- `rpg/ngemis.js` → `plugins/rpg/usanagi-ngemis.js`
- `rpg/ngojek.js` → `plugins/rpg/usanagi-ngojek.js`
- `rpg/npc.js` → `plugins/rpg/usanagi-npc.js`
- `rpg/nulis.js` → `plugins/rpg/usanagi-nulis.js`
- `rpg/nyapu.js` → `plugins/rpg/usanagi-nyapu.js`
- `rpg/outpost.js` → `plugins/rpg/usanagi-outpost.js`
- `rpg/parkir.js` → `plugins/rpg/usanagi-parkir.js`
- `rpg/party.js` → `plugins/rpg/usanagi-party.js`
- `rpg/partytrain.js` → `plugins/rpg/usanagi-partytrain.js`
- `rpg/pet.js` → `plugins/rpg/usanagi-pet.js`
- `rpg/petarena.js` → `plugins/rpg/usanagi-petarena.js`
- `rpg/petbond.js` → `plugins/rpg/usanagi-petbond.js`
- `rpg/petcare.js` → `plugins/rpg/usanagi-petcare.js`
- `rpg/petheal.js` → `plugins/rpg/usanagi-petheal.js`
- `rpg/petshop.js` → `plugins/rpg/usanagi-petshop.js`
- `rpg/petskill.js` → `plugins/rpg/usanagi-petskill.js`
- `rpg/pettalent.js` → `plugins/rpg/usanagi-pettalent.js`
- `rpg/portal.js` → `plugins/rpg/usanagi-portal.js`
- `rpg/profession.js` → `plugins/rpg/usanagi-profession.js`
- `rpg/profile.js` → `plugins/rpg/usanagi-profile.js`
- `rpg/quest.js` → `plugins/rpg/usanagi-quest.js`
- `rpg/ranch.js` → `plugins/rpg/usanagi-ranch.js`
- `rpg/recruit.js` → `plugins/rpg/usanagi-recruit.js`
- `rpg/refine.js` → `plugins/rpg/usanagi-refine.js`
- `rpg/relic.js` → `plugins/rpg/usanagi-relic.js`
- `rpg/relicforge.js` → `plugins/rpg/usanagi-relicforge.js`
- `rpg/repay.js` → `plugins/rpg/usanagi-repay.js`
- `rpg/reputation.js` → `plugins/rpg/usanagi-reputation.js`
- `rpg/rob.js` → `plugins/rpg/usanagi-rob.js`
- `rpg/salvage.js` → `plugins/rpg/usanagi-salvage.js`
- `rpg/sanctuary.js` → `plugins/rpg/usanagi-sanctuary.js`
- `rpg/scout.js` → `plugins/rpg/usanagi-scout.js`
- `rpg/season.js` → `plugins/rpg/usanagi-season.js`
- `rpg/sellall.js` → `plugins/rpg/usanagi-sellall.js`
- `rpg/shear.js` → `plugins/rpg/usanagi-shear.js`
- `rpg/shop.js` → `plugins/rpg/usanagi-shop.js`
- `rpg/shrine.js` → `plugins/rpg/usanagi-shrine.js`
- `rpg/slot.js` → `plugins/rpg/usanagi-slot.js`
- `rpg/smelt.js` → `plugins/rpg/usanagi-smelt.js`
- `rpg/stamina.js` → `plugins/rpg/usanagi-stamina.js`
- `rpg/steal.js` → `plugins/rpg/usanagi-steal.js`
- `rpg/streamer.js` → `plugins/rpg/usanagi-streamer.js`
- `rpg/study.js` → `plugins/rpg/usanagi-study.js`
- `rpg/survey.js` → `plugins/rpg/usanagi-survey.js`
- `rpg/talk.js` → `plugins/rpg/usanagi-talk.js`
- `rpg/tannery.js` → `plugins/rpg/usanagi-tannery.js`
- `rpg/tavern.js` → `plugins/rpg/usanagi-tavern.js`
- `rpg/titles.js` → `plugins/rpg/usanagi-titles.js`
- `rpg/tower.js` → `plugins/rpg/usanagi-tower.js`
- `rpg/tradehouse.js` → `plugins/rpg/usanagi-tradehouse.js`
- `rpg/training.js` → `plugins/rpg/usanagi-training.js`
- `rpg/transfer.js` → `plugins/rpg/usanagi-transfer.js`
- `rpg/trapcraft.js` → `plugins/rpg/usanagi-trapcraft.js`
- `rpg/treasure.js` → `plugins/rpg/usanagi-treasure.js`
- `rpg/trials.js` → `plugins/rpg/usanagi-trials.js`
- `rpg/use.js` → `plugins/rpg/usanagi-use.js`
- `rpg/voyage.js` → `plugins/rpg/usanagi-voyage.js`
- `rpg/weather.js` → `plugins/rpg/usanagi-weather.js`
- `rpg/weekly.js` → `plugins/rpg/usanagi-weekly.js`
- `rpg/woodcut.js` → `plugins/rpg/usanagi-woodcut.js`
- `rpg/work.js` → `plugins/rpg/usanagi-work.js`
- `rpg/workshop.js` → `plugins/rpg/usanagi-workshop.js`
- `rpg/worldmap.js` → `plugins/rpg/usanagi-worldmap.js`

## search (4)

- `search/search-pinterest.js` → `plugins/search/usanagi-search-pinterest.js`
- `search/search-playstore.js` → `plugins/search/usanagi-search-playstore.js`
- `search/search-spotify.js` → `plugins/search/usanagi-search-spotify.js`
- `search/ttsearch.js` → `plugins/search/usanagi-ttsearch.js`

## sticker (4)

- `sticker/brat.js` → `plugins/sticker/usanagi-brat.js`
- `sticker/squid.js` → `plugins/sticker/usanagi-squid.js`
- `sticker/sticker.js` → `plugins/sticker/usanagi-sticker.js`
- `sticker/upin.js` → `plugins/sticker/usanagi-upin.js`

## tools (19)

- `tools/cekidch.js` → `plugins/tools/usanagi-cekidch.js`
- `tools/cekidgc.js` → `plugins/tools/usanagi-cekidgc.js`
- `tools/enc.js` → `plugins/tools/usanagi-enc.js`
- `tools/hd.js` → `plugins/tools/usanagi-hd.js`
- `tools/hd2.js` → `plugins/tools/usanagi-hd2.js`
- `tools/hd3.js` → `plugins/tools/usanagi-hd3.js`
- `tools/hdvid.js` → `plugins/tools/usanagi-hdvid.js`
- `tools/igprofile3d.js` → `plugins/tools/usanagi-igprofile3d.js`
- `tools/nulis.js` → `plugins/tools/usanagi-nulis.js`
- `tools/quotesvideo.js` → `plugins/tools/usanagi-quotesvideo.js`
- `tools/readmore.js` → `plugins/tools/usanagi-readmore.js`
- `tools/removebg.js` → `plugins/tools/usanagi-removebg.js`
- `tools/rvo.js` → `plugins/tools/usanagi-rvo.js (disabled)`
- `tools/storyvideo.js` → `plugins/tools/usanagi-storyvideo.js`
- `tools/swhd.js` → `plugins/tools/usanagi-swhd.js`
- `tools/toaudio.js` → `plugins/tools/usanagi-toaudio.js`
- `tools/toimg.js` → `plugins/tools/usanagi-toimg.js`
- `tools/tourl.js` → `plugins/tools/usanagi-tourl.js`
- `tools/tovideo.js` → `plugins/tools/usanagi-tovideo.js`
