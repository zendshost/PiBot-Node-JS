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
        
        // Mengambil saldo dari API
        const res = await axios.get(`http://4.194.35.14:31401/accounts/${senderPublic}`);
        const balanceInfo = res.data.balances.find(b => b.asset_type === 'native');
        const balance = balanceInfo ? Number(balanceInfo.balance) : 0.0;
        console.log(`💰 Saldo Pi: ${balance.toFixed(7)}`);

        // 1. Ambil base fee dari server
        const baseFee = await server.fetchBaseFee();
        const feeInStroops = (baseFee * 2).toString(); // Fee dalam satuan terkecil (stroops)
        const feeInPi = Number(feeInStroops) / 1e7;    // Konversi fee ke Pi (1 Pi = 10,000,000 stroops)
        
        // 2. Tentukan minimum reserve
        const minimumReserve = 1; // Reserve wajib di jaringan Pi/Stellar adalah 1

        // 3. Hitung jumlah maksimal yang bisa dikirim
        const sweepAmount = balance - minimumReserve - feeInPi;
        console.log(` kalkulasi: ${balance} (saldo) - ${minimumReserve} (reserve) - ${feeInPi} (fee) = ${sweepAmount.toFixed(7)}`);
        
        if (sweepAmount <= 0) {
            console.log("⚠️ Saldo tidak cukup untuk melakukan sweep (kurang dari 1 Pi + fee). Melewati dompet ini...");
            return;
        }

        const formattedAmount = sweepAmount.toFixed(7).toString();
        console.log(`➡️ Sweeping: ${formattedAmount} Pi ke ${recipient}`);

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee: feeInStroops, // Gunakan fee dalam stroops yang sudah dihitung
            networkPassphrase: 'Pi Network',
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: recipient,
                asset: StellarSdk.Asset.native(),
                amount: formattedAmount, // Gunakan jumlah yang sudah dihitung
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
                console.log("⚠️ File pharse.txt kosong atau tidak ditemukan. Mencoba lagi dalam 1 detik...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            
            console.log(`\n======================================================`);
            console.log(`✨ Memulai siklus sweep, ditemukan ${mnemonics.length} dompet. Akan berjalan non-stop.`);
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
            console.log("Mencoba lagi dalam 1 detik...");
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

main();
