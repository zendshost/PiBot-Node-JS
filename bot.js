const fs = require('fs');
const StellarSdk = require('stellar-sdk');
const ed25519 = require('ed25519-hd-key');
const bip39 = require('bip39');
const axios = require('axios');
require("dotenv").config();

const PI_NODES = [
    'http://4.194.35.14:31401',
    'http://113.160.156.51:31401',
    'http://113.161.1.223:31401',
    'http://125.184.235.25:31401',
    'http://81.240.60.124:31401',
    'http://115.77.187.165:31401',
    'http://113.176.102.87:31401',
    'http://14.36.220.65:31401',
    'http://59.28.84.207:31401',
    'http://61.85.151.254:31401',
    'http://175.198.73.187:31401',
    'http://183.97.22.176:31401',
    'http://203.236.58.84:31401',
    'http://221.144.51.60:31401'
];

async function getPiWalletAddressFromSeed(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
        console.error(`❌ Mnemonic tidak valid: "${mnemonic.substring(0, 15)}..."`);
        return null;
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivationPath = "m/44'/314159'/0'";
    const { key } = ed25519.derivePath(derivationPath, seed.toString('hex'));
    const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);
    return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
    };
}

async function processWallet(mnemonic, server, recipient) {
    // <<< PERUBAHAN DI SINI: Tambahkan tanda kurung () setelah hostname >>>
    console.log(`\n--- Memproses dompet: "${mnemonic.substring(0, 15)}..." | Menggunakan Node: ${server.serverURL.hostname()} ---`);

    try {
        const wallet = await getPiWalletAddressFromSeed(mnemonic);
        if (!wallet) return;

        const senderSecret = wallet.secretKey;
        const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
        const senderPublic = wallet.publicKey;

        console.log("🔑 Public Key:", senderPublic);

        const account = await server.loadAccount(senderPublic);
        
        const baseUrl = server.serverURL.toString();
        const res = await axios.get(`${baseUrl}accounts/${senderPublic}`);
        const balanceInfo = res.data.balances.find(b => b.asset_type === 'native');
        const balance = balanceInfo ? Number(balanceInfo.balance) : 0.0;
        console.log(`💰 Saldo Pi: ${balance.toFixed(7)}`);

        const baseFee = await server.fetchBaseFee();
        const feeInStroops = (baseFee * 2).toString();
        const feeInPi = Number(feeInStroops) / 1e7;
        
        const minimumReserve = 1;
        const sweepAmount = balance - minimumReserve - feeInPi;
        console.log(` Kalkulasi: ${balance.toFixed(7)} (saldo) - ${minimumReserve} (reserve) - ${feeInPi} (fee) = ${sweepAmount.toFixed(7)}`);
        
        if (sweepAmount <= 0) {
            console.log("⚠️ Saldo tidak cukup untuk sweep. Melewati dompet ini...");
            return;
        }

        const formattedAmount = sweepAmount.toFixed(7).toString();
        console.log(`➡️ Sweeping: ${formattedAmount} Pi ke ${recipient}`);

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee: feeInStroops,
            networkPassphrase: 'Pi Network',
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: recipient,
                asset: StellarSdk.Asset.native(),
                amount: formattedAmount,
            }))
            .setTimeout(30)
            .build();

        tx.sign(senderKeypair);
        const result = await server.submitTransaction(tx);
        
        console.log("✅ Sweep berhasil!");
        console.log(`🔗 Lihat Tx: https://blockexplorer.minepi.com/mainnet/transactions/${result.hash}`);

    } catch (e) {
        const errorMessage = e.response?.data?.extras?.result_codes || e.message || e;
        console.error('❌ Terjadi Error:', errorMessage);
    }
}

async function main() {
    const recipient = process.env.RECEIVER_ADDRESS;
    if (!recipient) {
        console.error("❌ Alamat penerima (RECEIVER_ADDRESS) tidak ditemukan di file .env.");
        return;
    }

    let serverIndex = 0;

    while (true) {
        try {
            const mnemonics = fs.readFileSync('pharse.txt', 'utf-8')
                .split('\n')
                .filter(line => line.trim() !== '');

            if (mnemonics.length === 0) {
                console.log("⚠️ File pharse.txt kosong. Mencoba lagi dalam 5 detik...");
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            
            console.log(`\n======================================================`);
            console.log(`✨ Memulai siklus sweep, ditemukan ${mnemonics.length} dompet. Akan merotasi ${PI_NODES.length} server.`);
            console.log(`======================================================`);

            for (const mnemonic of mnemonics) {
                const currentServerUrl = PI_NODES[serverIndex];
                const server = new StellarSdk.Server(currentServerUrl, { allowHttp: true });
                
                await processWallet(mnemonic.trim(), server, recipient);

                serverIndex = (serverIndex + 1) % PI_NODES.length;
            }

            console.log(`\n✅ Siklus selesai. Langsung memulai dari awal...`);

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error("❌ Error: File 'pharse.txt' tidak ditemukan.");
            } else {
                console.error("❌ Terjadi error pada loop utama:", error.message);
            }
            console.log("Mencoba lagi dalam 10 detik...");
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

main();
