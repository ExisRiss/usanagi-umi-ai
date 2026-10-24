import { AIRich } from '../../lib/ui/MessageBuilder.js'

let handler = async (m, { conn }) => {
    let rich = new AIRich(conn)

    // Mengambil gambar rasio 16:9 dari global config
    rich.addImage(global.images.ratio_16_9.url, {
        width: global.images.ratio_16_9.width,
        height: global.images.ratio_16_9.height
    })

    rich.addSection({
        view_model: {
            primitive: {
                __typename: 'GenAICompactEntityPrimitive',
                title: global.ownerInfo.title,
                subtitle: global.ownerInfo.subtitle,
                secondary_subtitle: global.ownerInfo.secondary_subtitle,
                entity_id: global.ownerInfo.entity_id,
                entity_url: global.ownerInfo.entity_url,
                entity_type: 'PAGE',
                action_type: 'FOLLOW',
                is_verified: true,
                image: {
                    // Mengambil gambar rasio 1:1 dari global config
                    url: global.images.ratio_1_1.url,
                    url_fallback: global.images.ratio_1_1.url_fallback
                }
            },
            __typename: 'GenAISingleLayoutViewModel'
        }
    })

    rich.addText(global.brandCredit || 'By AlzRiss - Usanagi Umi AI')

    await rich.send(m.chat, {
        quoted: m
    })
}

handler.help = ['creator', 'developer']
handler.tags = ['main']
handler.command = /^(creator|dev|developer)$/i

export default handler