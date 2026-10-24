import fs from 'fs'
import { parse } from '@babel/parser'
import traverseModule from '@babel/traverse'

const traverse = traverseModule.default || traverseModule

function createCollector() {
    return {
        axios: [],
        fetch: [],
        got: [],
        undici: [],

        endpoints: [],

        formData: 0,
        urlSearchParams: 0
    }
}

function createResult(file) {
    return {
        file,
        imports: [],
        requires: [],
        exports: [],
        functions: [],
        classes: [],

        collector: createCollector(),

        errors: []
    }
}

function unique(arr) {
    return [...new Set(arr)]
}

function add(arr, value) {
    if (!value) return

    if (!arr.includes(value))
        arr.push(value)
}

export function parseFile(file) {
    const result = createResult(file)

    try {
        const code = fs.readFileSync(file, 'utf8')

        const ast = parse(code, {
            sourceType: 'unambiguous',
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
            plugins: [
                'typescript',
                'jsx',
                'classProperties',
                'dynamicImport',
                'optionalChaining',
                'objectRestSpread'
            ]
        })

        traverse(ast, {

            ImportDeclaration(path) {
                result.imports.push(path.node.source.value)
            },

            CallExpression(path) {

    const node = path.node

    // ===== require =====

    if (
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments.length
    ) {

        const arg = node.arguments[0]

        if (arg.type === 'StringLiteral')
            result.requires.push(arg.value)

    }

    // ===== axios.xxx =====

    if (
        node.callee.type === 'MemberExpression'
    ) {

        const obj = node.callee.object
        const prop = node.callee.property

        if (
            obj.type === 'Identifier' &&
            obj.name === 'axios'
        ) {

            add(result.collector.axios, prop.name)

        }

    }

    // ===== fetch() =====

    if (
        node.callee.type === 'Identifier' &&
        node.callee.name === 'fetch'
    ) {

        add(result.collector.fetch, 'fetch')

    }

},

NewExpression(path) {

    const callee = path.node.callee

    if (callee.type !== 'Identifier')
        return

    switch (callee.name) {

        case 'FormData':
            result.collector.formData++
            break

        case 'URLSearchParams':
            result.collector.urlSearchParams++
            break

    }

},

StringLiteral(path) {

    const value = path.node.value

    if (typeof value !== 'string')
        return

    // Endpoint
    if (/^https?:\/\//i.test(value)) {
        add(result.collector.endpoints, value)
    }

},

            ExportNamedDeclaration(path) {
                if (!path.node.declaration) return

                const dec = path.node.declaration

                if (dec.id?.name)
                    result.exports.push(dec.id.name)
            },

            AssignmentExpression(path) {

                const left = path.node.left

                if (
                    left.type === 'MemberExpression'
                ) {

                    const obj = left.object

                    if (
                        obj.type === 'Identifier' &&
                        obj.name === 'module'
                    ) {
                        result.exports.push('module.exports')
                    }

                    if (
                        obj.type === 'Identifier' &&
                        obj.name === 'exports'
                    ) {
                        result.exports.push('exports')
                    }

                }

            },

            FunctionDeclaration(path) {

                if (path.node.id)
                    result.functions.push(path.node.id.name)

            },

            ClassDeclaration(path) {

                if (path.node.id)
                    result.classes.push(path.node.id.name)

            }

        })

    } catch (e) {

        result.errors.push(e.message)

    }

result.collector.axios = unique(result.collector.axios)
result.collector.fetch = unique(result.collector.fetch)
result.collector.got = unique(result.collector.got)
result.collector.undici = unique(result.collector.undici)
result.collector.endpoints = unique(result.collector.endpoints)

    return result
}

export function parseFiles(files = []) {

    const output = []

    for (const file of files) {

        output.push(parseFile(file))

    }

    return output

}

export async function test(scan) {

    const result = parseFiles(scan.js)

    console.log({
    files: result.length,

    imports: result.reduce((a,b)=>a+b.imports.length,0),
    requires: result.reduce((a,b)=>a+b.requires.length,0),
    exports: result.reduce((a,b)=>a+b.exports.length,0),
    functions: result.reduce((a,b)=>a+b.functions.length,0),
    classes: result.reduce((a,b)=>a+b.classes.length,0),

    axios: result.reduce((a,b)=>a+b.collector.axios.length,0),
    fetch: result.reduce((a,b)=>a+b.collector.fetch.length,0),

    endpoints: result.reduce((a,b)=>a+b.collector.endpoints.length,0),

    formData: result.reduce((a,b)=>a+b.collector.formData,0),

    urlSearchParams: result.reduce((a,b)=>a+b.collector.urlSearchParams,0),

    errors: result.filter(v=>v.errors.length).length
})

    return result

}

export default {
    parseFile,
    parseFiles,
    test
}