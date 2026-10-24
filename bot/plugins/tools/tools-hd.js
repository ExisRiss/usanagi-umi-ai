import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import crypto from 'crypto';
import sharp from 'sharp';

let handler = async (m, { conn, usedPrefix, command }) => {
	const quoted = m.quoted ? m.quoted : m;
	const mediaMessage = quoted.msg || quoted;
	const mime = String(mediaMessage?.mimetype || '');
	if (!/image/i.test(mime)) return m.reply(`Kirim/Reply foto asli dengan caption ${usedPrefix + command}`);

    let media;
    try {
        media = await quoted.download();
    } catch (error) {
        const emptyKey = /empty media key|derive from empty/i.test(String(error?.message || error));
        const guidance = emptyKey
            ? 'Media dari newsletter/channel tidak membawa kunci unduhan. Download gambarnya lalu kirim ulang sebagai foto biasa, kemudian gunakan command ini.'
            : `Foto gagal diunduh: ${error?.message || error}`;
        return m.reply(`❌ ${guidance}`);
    }
    if (!Buffer.isBuffer(media) || !media.length) {
        return m.reply('❌ Data foto kosong. Kirim ulang foto asli, lalu coba lagi.');
    }
	let res;
    
    // Tentukan scale berdasarkan command
    let scale = /^hdr$/i.test(command) ? 4 : 2;

    try {
        // Coba menggunakan iLoveIMG
        res = await hdr(media, scale);
    } catch (e) {
        console.log('[iLoveIMG Error] Fallback ke Remini...', e.message);
        try {
            // Fallback menggunakan Remini API
            res = await reminiHDFallback(media);
        } catch (err) {
            return m.reply(`Gagal memproses gambar. Error: ${err.message}`);
        }
    }

	conn.sendFile(m.chat, res, 'hd.png', 'Nih Hasilnya', m);
};
handler.help = ['hd', 'hdr'];
handler.tags = ['tools'];
handler.command = /^(hd|hdr)$/i;
handler.limit = true;
export default handler;

// ======================= [ iLoveIMG API ] =======================
async function getToken() {
	try {
		const html = await axios.get('https://www.iloveimg.com/upscale-image');
		const $ = cheerio.load(html.data);
		const script = $('script')
			.filter((i, el) => $(el).html().includes('ilovepdfConfig ='))
			.html();
		const jsonS = script.split('ilovepdfConfig = ')[1].split(';')[0];
		const json = JSON.parse(jsonS);
		const csrf = $('meta[name="csrf-token"]').attr('content');
		return {
			token: json.token,
			csrf,
		};
	} catch (err) {
		throw new Error('Error: ' + err.message);
	}
}

async function uploadImage(server, headers, buffer, task) {
	const form = new FormData();
	form.append('name', 'image.jpg');
	form.append('chunk', '0');
	form.append('chunks', '1');
	form.append('task', task);
	form.append('preview', '1');
	form.append('file', buffer, 'image.jpg');

	const res = await axios.post(`https://${server}.iloveimg.com/v1/upload`, form, {
		headers: {
			...headers,
			...form.getHeaders(),
		},
	});

	return res.data;
}

async function hdr(buffer, scale = 4) {
	const { token, csrf } = await getToken();
	const servers = [
		'api1g', 'api2g', 'api3g', 'api8g', 'api9g', 'api10g', 'api11g',
		'api12g', 'api13g', 'api14g', 'api15g', 'api16g', 'api17g', 'api18g',
		'api19g', 'api20g', 'api21g', 'api22g', 'api24g', 'api25g',
	];
	const server = servers[Math.floor(Math.random() * servers.length)];

	const task = 'r68zl88mq72xq94j2d5p66bn2z9lrbx20njsbw2qsAvgmzr11lvfhAx9kl87pp6yqgx7c8vg7sfbqnrr42qb16v0gj8jl5s0kq1kgp26mdyjjspd8c5A2wk8b4Adbm6vf5tpwbqlqdr8A9tfn7vbqvy28ylphlxdl379psxpd8r70nzs3sk1';
	const headers = {
		Authorization: 'Bearer ' + token,
		Origin: 'https://www.iloveimg.com/',
		Cookie: '_csrf=' + csrf,
		'User-Agent': 'Mozilla/5.0',
	};

	const upload = await uploadImage(server, headers, buffer, task);

	const form = new FormData();
	form.append('task', task);
	form.append('server_filename', upload.server_filename);
	form.append('scale', scale);

	const res = await axios.post(`https://${server}.iloveimg.com/v1/upscale`, form, {
		headers: {
			...headers,
			...form.getHeaders(),
		},
		responseType: 'arraybuffer',
	});

	return res.data;
}

// ======================= [ Remini API Fallback ] =======================
const API = 'https://a.android.api.remini.ai/v1/mobile';
const ORACLE = 'https://api.remini.ai/v1/mobile/oracle';

function genId() {
  const a = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return { 
      android_id: a, 
      aaid: crypto.randomUUID(), 
      backup_persistent_id: a + '_com.bigwinepot.nwdn.international', 
      non_backup_persistent_id: crypto.randomUUID() 
  };
}

let dev = genId();
let token = null;

function bh(extra) {
  return {
    'bsp-id': 'com.bigwinepot.nwdn.international.android',
    'build-number': '202514479', 'build-version': '3.7.1020',
    'country': 'US', 'device-manufacturer': 'Samsung', 'device-model': 'SM-G998B',
    'device-type': '6.8', 'language': 'en', 'locale': 'en_US',
    'os-version': '33', 'platform': 'Android', 'timezone': 'America/New_York',
    'android-id': dev.android_id, 'aaid': dev.aaid,
    'accept-encoding': 'gzip', 'user-agent': 'okhttp/4.12.0',
    ...(extra || {}),
  };
}

function ah(extra) {
  const h = bh(extra);
  if (token) h['identity-token'] = token;
  return h;
}

async function auth() {
  dev = genId();
  const r = await fetch(ORACLE + '/setup', {
    headers: bh({
      'first-install-timestamp': Math.floor(Date.now()/1000)+'E9',
      'backup-persistent-id': dev.backup_persistent_id,
      'non-backup-persistent-id': dev.non_backup_persistent_id,
      'environment': 'Production', 'settings-response-version': 'v2',
      'is-app-running-in-background': 'false', 'is-old-user': 'true',
      'app-set-id': 'd44bd45a-a45d-4470-9674-7348a8e3fb71',
    })
  });
  const d = await r.json();
  token = d.settings.__identity__.token;
  if (!token) throw new Error('No token from Remini');
  await fetch(API + '/users/@me', { headers: ah() });
}

async function reminiHDFallback(buffer) {
  await auth();
  const mime = 'image/jpeg'; // WhatsApp default image output
  const md5 = crypto.createHash('md5').update(buffer).digest('base64');
  
  let meta = { size: buffer.length };
  try { 
      const m = await sharp(buffer).metadata(); 
      meta.width = m.width; 
      meta.height = m.height; 
  } catch (err) {}

  const taskR = await fetch(API + '/tasks', {
    method: 'POST',
    headers: ah({'content-type':'application/json; charset=UTF-8'}),
    body: JSON.stringify({
      image_content_type: mime, 
      image_md5: md5,
      feature: { type: 'enhance', models: [] },
      metadata: meta,
      options: { high_quality_output: false, save_input: true },
    })
  });

  const taskD = await taskR.json();
  if (!taskD.task_id || !taskD.upload_url || !taskD.upload_headers) throw new Error('Missing fields in Remini Task');
  
  await fetch(taskD.upload_url, {
    method: 'PUT',
    headers: { ...taskD.upload_headers, 'Content-Length': buffer.length.toString(), 'User-Agent': 'okhttp/4.12.0' },
    body: buffer,
  });

  await fetch(API + '/tasks/' + taskD.task_id + '/process', {
    method: 'POST',
    headers: ah({'content-length':'0'}),
  });

  let cdnUrl = null;
  for (let i=0; i<40; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pr = await fetch(API + '/tasks/' + taskD.task_id, { headers: ah() });
    const pd = await pr.json();
    if (pd.status === 'completed') {
      const outs = pd.result && pd.result.outputs;
      if (outs && Array.isArray(outs) && outs[0] && outs[0].url) cdnUrl = outs[0].url;
      break;
    }
    if (pd.status === 'failed' || pd.status === 'error') throw new Error('Remini Task failed');
  }

  if (!cdnUrl) throw new Error('No output URL from Remini');
  
  // Return ArrayBuffer format seperti fungsi hdr iLoveIMG
  const finalImage = await axios.get(cdnUrl, { responseType: 'arraybuffer' });
  return Buffer.from(finalImage.data);
}