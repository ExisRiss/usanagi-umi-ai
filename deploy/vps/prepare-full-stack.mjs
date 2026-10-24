#!/usr/bin/env node
// Run from a fresh source checkout. Never touches config, sessions, or databases.
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')
const game=path.join(root,'bot/game')
if(fs.existsSync(game)||fs.lstatSync(path.join(root,'bot')).isSymbolicLink())throw Error('Existing bot/game or symlinked bot: inspect manually; no overwrite permitted')
const dest=path.join(root,'bot/scripts/companion.js')
if(fs.existsSync(dest))throw Error('Existing companion: inspect diff manually; no overwrite permitted')
fs.symlinkSync('../db-mirror',game,'dir')
fs.copyFileSync(path.join(root,'db-mirror/companion.js'),dest,fs.constants.COPYFILE_EXCL)
console.log('Prepared game link and companion only. Restore private runtime before starting; no credentials generated.')
