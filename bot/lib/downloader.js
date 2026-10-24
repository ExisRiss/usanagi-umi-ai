import axios from 'axios'
import fs from 'fs'
import path from 'path'
import * as tar from 'tar'

const TMP = path.resolve('./tmp/scrape')

async function ensure(dir) {
    await fs.promises.mkdir(dir, { recursive: true })
}

async function remove(dir) {
    await fs.promises.rm(dir, {
        recursive: true,
        force: true
    })
}

export async function download(url, pkg) {
    if (!url) throw new Error('Tarball URL is required')

    await ensure(TMP)

    const outDir = path.join(TMP, pkg)
    const tgz = path.join(TMP, `${pkg}.tgz`)

    await remove(outDir)

    const { data } = await axios.get(url, {
        responseType: 'stream',
        headers: {
            'User-Agent': 'ScrapeGenerator/1.0'
        }
    })

    const writer = fs.createWriteStream(tgz)

    data.pipe(writer)

    await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })

    await ensure(outDir)

    await tar.x({
        file: tgz,
        cwd: outDir,
        strip: 1
    })

    await fs.promises.unlink(tgz).catch(() => {})

    return outDir
}

export async function test(pkg = 'sengkrep-ryna') {
    const { default: registry } = await import('./npm-registry.js')

    const meta = await registry.getPackage(pkg)

    const dir = await download(
        registry.getTarball(meta),
        pkg.replace(/[\/@]/g, '_')
    )

    console.log({
        extracted: dir,
        files: fs.readdirSync(dir)
    })

    return dir
}

export default {
    download,
    test
}