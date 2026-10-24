import fs from 'fs'
import path from 'path'

const JS_EXT = ['.js', '.mjs', '.cjs']
const TS_EXT = ['.ts', '.mts', '.cts']
const MD_EXT = ['.md', '.markdown']
const JSON_EXT = ['.json']
const YAML_EXT = ['.yaml', '.yml']
const TXT_EXT = ['.txt']

const EXAMPLE_NAME = [
    'example',
    'examples',
    'demo',
    'sample',
    'samples',
    'usage',
    'docs',
    'test'
]

async function walk(dir, arr = []) {
    const files = await fs.promises.readdir(dir, {
        withFileTypes: true
    })

    for (const file of files) {
        const full = path.join(dir, file.name)

        if (file.isDirectory()) {
            await walk(full, arr)
        } else {
            arr.push(full)
        }
    }

    return arr
}

function type(ext) {
    if (JS_EXT.includes(ext)) return 'js'
    if (TS_EXT.includes(ext)) return 'ts'
    if (MD_EXT.includes(ext)) return 'md'
    if (JSON_EXT.includes(ext)) return 'json'
    if (YAML_EXT.includes(ext)) return 'yaml'
    if (TXT_EXT.includes(ext)) return 'txt'
    return 'other'
}

function isExample(file) {
    const lower = file.toLowerCase()

    return EXAMPLE_NAME.some(x => lower.includes(x))
}

function stat(file) {
    const s = fs.statSync(file)

    return {
        size: s.size,
        created: s.birthtime,
        modified: s.mtime
    }
}

export async function scan(root) {
    if (!fs.existsSync(root))
        throw new Error('Directory not found.')

    const files = await walk(root)

    const result = {
        root,

        files: [],

        js: [],
        ts: [],
        md: [],
        json: [],
        yaml: [],
        txt: [],
        other: [],

        examples: [],

        packageJson: null,
        readme: null,

        stats: {
            totalFiles: 0,
            js: 0,
            ts: 0,
            md: 0,
            json: 0,
            yaml: 0,
            txt: 0,
            other: 0,
            totalSize: 0
        }
    }

    for (const file of files) {

        const ext = path.extname(file)

        const t = type(ext)

        const info = stat(file)

        result.files.push({
            path: file,
            type: t,
            ...info
        })

        result.stats.totalFiles++
        result.stats.totalSize += info.size

        switch (t) {

            case 'js':
                result.js.push(file)
                result.stats.js++
                break

            case 'ts':
                result.ts.push(file)
                result.stats.ts++
                break

            case 'md':
                result.md.push(file)
                result.stats.md++
                break

            case 'json':
                result.json.push(file)
                result.stats.json++
                break

            case 'yaml':
                result.yaml.push(file)
                result.stats.yaml++
                break

            case 'txt':
                result.txt.push(file)
                result.stats.txt++
                break

            default:
                result.other.push(file)
                result.stats.other++
        }

        const name = path.basename(file).toLowerCase()

        if (name === 'package.json')
            result.packageJson = file

        if (
            name === 'readme.md' ||
            name === 'readme.markdown'
        )
            result.readme = file

        if (isExample(file))
            result.examples.push(file)

    }

    return result
}

export async function test(dir) {

    const result = await scan(dir)

    console.log({
        root: result.root,

        packageJson: result.packageJson,

        readme: result.readme,

        examples: result.examples.length,

        js: result.js.length,

        ts: result.ts.length,

        md: result.md.length,

        json: result.json.length,

        total: result.stats.totalFiles,

        size: result.stats.totalSize
    })

    return result

}

export default {
    scan,
    test
}