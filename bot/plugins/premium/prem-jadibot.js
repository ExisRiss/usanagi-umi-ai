import {
    startSubBot,
    stopSubBot,
    getSubBots,
    getSubBotCount
} from '../../lib/jadibot.js';


const handler = async (
    m,
    {
        conn,
        text,
        command
    }
) => {

    /* ========================================================
     * JADIBOT
     * ======================================================== */

    if (
        command === 'jadibot'
    ) {

        if (!text) {

            return m.reply(
                `🤖 *JADIBOT*\n\n` +
                `Gunakan:\n` +
                `*.jadibot 628xxxxxxxxxx*`
            );
        }


        return startSubBot(
            m,
            conn,
            text.trim()
        );
    }


    /* ========================================================
     * STOP JADIBOT
     * ======================================================== */

    if (
        command === 'stopjadibot'
    ) {

        if (!text) {

            return m.reply(
                `Gunakan:\n` +
                `*.stopjadibot 628xxxxxxxxxx*`
            );
        }


        const result =
            await stopSubBot(
                text.trim()
            );


        if (!result) {

            return m.reply(
                `❌ Nomor tersebut tidak sedang menjadi sub-bot.`
            );
        }


        return m.reply(
            `✅ Sub-bot *${text.trim()}* berhasil dihentikan.\n\n` +
            `Session juga sudah dihapus.`
        );
    }


    /* ========================================================
     * LIST JADIBOT
     * ======================================================== */

    if (
        command === 'listjadibot' ||
        command === 'listjadirbot'
    ) {

        const list =
            getSubBots();


        if (
            !list.length
        ) {

            return m.reply(
                `📭 Belum ada sub-bot yang aktif.`
            );
        }


        let teks =
            `🤖 *LIST JADIBOT*\n\n`;


        teks +=
            `Total aktif: *${getSubBotCount()}*\n\n`;


        for (
            const [number]
            of list
        ) {

            teks +=
                `• +${number}\n`;
        }


        return m.reply(
            teks
        );
    }
};


handler.help = [
    'jadibot <nomor>',
    'stopjadibot <nomor>',
    'listjadibot'
];


handler.tags = [
    'owner'
];


handler.command = [
    'jadibot',
    'stopjadibot',
    'listjadibot',
    'listjadirbot'
];


handler.premium =
    true;


export default handler;