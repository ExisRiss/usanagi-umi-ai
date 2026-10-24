import test from 'node:test'
import assert from 'node:assert/strict'
import {readWalletFile,writeWalletFile,creditWallet,debitWallet,walletSnapshot} from '../lib/wallet-core.js'
test('recovery mode rejects reads and writes instead of fabricating zero balance or new ledger',()=>{
 const old=process.env.UMI_WALLET_RECOVERY_REQUIRED;process.env.UMI_WALLET_RECOVERY_REQUIRED='true'
 try{for(const action of [()=>readWalletFile(),()=>writeWalletFile({accounts:{}}),()=>walletSnapshot('test-user-id'),()=>creditWallet({userId:'test-user-id',amount:10,reference:'fixture'}),()=>debitWallet({userId:'test-user-id',amount:10,reference:'fixture'})])assert.throws(action,e=>e.status===503&&e.recoveryRequired===true)}finally{if(old===undefined)delete process.env.UMI_WALLET_RECOVERY_REQUIRED;else process.env.UMI_WALLET_RECOVERY_REQUIRED=old}
})
