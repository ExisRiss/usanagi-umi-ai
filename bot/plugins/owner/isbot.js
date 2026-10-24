import { getDevice } from '@rexxhayanasi/elaina-baileys'

let handler = async (m, { conn, isOwner }) => {
    // Memastikan ada pesan yang di-reply
    const isbotQ = m.quoted ? m.quoted : null;
    if (!isbotQ) return m.reply('reply pesan yang mau dicek devicenya kak~ 🌸');

    try {
        const isbotSuspiciousMsgTypes = [
            'buttonsMessage', 'buttonsResponseMessage', 'templateMessage',
            'templateButtonReplyMessage', 'listMessage', 'listResponseMessage',
            'interactiveMessage', 'interactiveResponseMessage', 'botForwardedMessage'
        ];

        const isbotHasFooter = (content) => {
            content = content || {};
            return !!(
                content.footerText ||
                content.footer?.text ||
                (content.contentText && content.footerText)
            );
        };

        const isbotSender = isbotQ.sender || '';
        const isbotMsgId = isbotQ.id || '';
        const isbotDevice = getDevice(isbotMsgId);

        let isbotScore = 0;
        let isbotInteractiveFlag = false;
        let isbotHasFooterFlag = false;
        let isbotWebDeviceFlag = false;
        let isbotUnknownDeviceFlag = false;

        if (isbotDevice === 'web') { isbotScore += 10; isbotWebDeviceFlag = true; }
        if (isbotDevice === 'unknown') { isbotScore += 10; isbotUnknownDeviceFlag = true; }
        if (isbotSender.endsWith('@lid')) isbotScore += 3;
        if (isbotQ.isBaileys) isbotScore += 3;
        if (isbotQ.verifiedBizName) isbotScore += 2;
        if (/^3EB0|^BAE5/i.test(isbotMsgId)) isbotScore += 4;
        if (/bot|botz|robot/i.test(isbotQ.name || isbotQ.pushName || '')) isbotScore += 3;

        if (isbotSuspiciousMsgTypes.includes(isbotQ.mtype)) {
            isbotScore += 5;
            isbotInteractiveFlag = true;
        }

        // Sesuaikan dengan object message dari quoted
        let msgContent = isbotQ.msg || isbotQ.message || {};
        if (isbotHasFooter(msgContent)) {
            isbotScore += 4;
            isbotHasFooterFlag = true;
        }

        // Bugfix: di kodemu sebelumnya menggunakan 'quoted?.messageContextInfo' yang undefined
        const isbotDeviceList = isbotQ.messageContextInfo?.deviceListMetadata;
        if (!isbotDeviceList || Object.keys(isbotDeviceList).length === 0) isbotScore += 1;

        // Mode Debug opsional (Bisa dihapus jika tidak perlu tampil di terminal)
        console.log('[isbot debug]', {
            sender: isbotSender,
            msgId: isbotMsgId,
            device: isbotDevice,
            mtype: isbotQ.mtype,
            isBaileys: isbotQ.isBaileys,
            verifiedBizName: isbotQ.verifiedBizName,
            pushName: isbotQ.pushName,
            hasFooter: isbotHasFooterFlag,
            score: isbotScore
        });

        const isbotResult = isbotDevice === 'web' || isbotDevice === 'unknown' || isbotScore >= 6;
        const isbotReasons = [];
        
        if (isbotWebDeviceFlag) isbotReasons.push('device web');
        if (isbotUnknownDeviceFlag) isbotReasons.push('device/message ID tidak dikenali');
        if (isbotInteractiveFlag) isbotReasons.push('interactive message');
        if (isbotHasFooterFlag) isbotReasons.push('footer field');

        await m.reply(`.✦ ݁˖ *DEVICE CHECK*

✎ Message ID : ${isbotMsgId}
✎ Device : ${isbotDevice}
✎ Mtype : ${isbotQ.mtype || '-'}
✎ IsBot : ${isbotResult ? `Yes${isbotReasons.length ? ` (${isbotReasons.join(', ')})` : ''}` : 'No'}`);

    } catch (e) {
        console.error('isbot error:', e.message || e);
        m.reply('Aduh~ gagal cek device-nya nih (T_T) coba lagi ya~');
    }
}

handler.help = ['isbot', 'cekdevice']
handler.tags = ['owner']
handler.command = /^(isbot|cekdevice)$/i
handler.owner = true 

export default handler