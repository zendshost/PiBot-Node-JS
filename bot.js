const fs = require('fs');
const StellarSdk = require('stellar-sdk');
const ed25519 = require('ed25519-hd-key');
const bip39 = require('bip39');
const axios = require('axios');
require("dotenv").config();

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
    console.log(`\n--- Memproses dompet dari mnemonic: "${mnemonic.substring(0, 15)}..." ---`);

    try {
        const wallet = await getPiWalletAddressFromSeed(mnemonic);
        if (!wallet) {
            return;
        }

        const senderSecret = wallet.secretKey;
        const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
        const senderPublic = wallet.publicKey;

        console.log("🔑 Public Key:", senderPublic);

        const account = await server.loadAccount(senderPublic);
        const baseFee = await server.fetchBaseFee();
        const fee = (baseFee * 2).toString();

        const res = await axios.get(`http://4.194.35.14:31401/accounts/${senderPublic}`);
        const balanceInfo = res.data.balances.find(b => b.asset_type === 'native');
        const balance = balanceInfo ? balanceInfo.balance : '0.0';
        console.log(`💰 Saldo Pi: ${balance}`);

        const withdrawAmount = Number(balance) - 2;
        if (withdrawAmount <= 0.0000001) {
            console.log("⚠️ Saldo tidak cukup untuk mengirim. Melewati dompet ini...");
            return;
        }

        const formattedAmount = withdrawAmount.toFixed(7).toString();
        console.log(`➡️ Mengirim: ${formattedAmount} Pi ke ${recipient}`);

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee,
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
        
        console.log("✅ Transaksi berhasil!");
        console.log(`🔗 Lihat Tx: https://blockexplorer.minepi.com/mainnet/transactions/${result.hash}`);

    } catch (e) {
        const errorMessage = e.response?.data?.extras?.result_codes || e.message || e;
        console.error('❌ Terjadi Error:', errorMessage);
    }
}

async function main() {
    const recipient = process.env.RECEIVER_ADDRESS;
    if (!recipient) {
        console.error("❌ Alamat penerima (RECEIVER_ADDRESS) tidak ditemukan di file .env. Harap set terlebih dahulu.");
        return;
    }

    const server = new StellarSdk.Server('http://4.194.35.14:31401', { allowHttp: true });

    while (true) {
        try {
            const mnemonics = fs.readFileSync('pharse.txt', 'utf-8')
                .split('\n')
                .filter(line => line.trim() !== '');

            if (mnemonics.length === 0) {
                console.log("⚠️ File pharse.txt kosong atau tidak ditemukan. Mencoba lagi dalam 5 detik...");
                await new Promise(resolve => setTimeout(resolve, 5000)); // Jeda error
                continue;
            }
            
            console.log(`\n======================================================`);
            console.log(`✨ Memulai proses, ditemukan ${mnemonics.length} dompet. Akan berjalan non-stop.`);
            console.log(`======================================================`);

            for (const mnemonic of mnemonics) {
                await processWallet(mnemonic.trim(), server, recipient);
            }
            console.log(`\n✅ Siklus selesai. Langsung memulai dari awal...`);

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error("❌ Error: File 'pharse.txt' tidak ditemukan. Harap buat file tersebut.");
            } else {
                console.error("❌ Terjadi error pada loop utama:", error.message);
            }
            console.log("Mencoba lagi dalam 30 detik...");
            await new Promise(resolve => setTimeout(resolve, 30000)); // Jeda saat error fatal tetap ada agar tidak spam
        }
    }
}

main();

// Free Source Code
// PI auto Transfer bot
// telegram: @zendshost
