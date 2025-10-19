const StellarSdk = require('stellar-sdk');
const ed25519 = require('ed25519-hd-key');
const bip39 = require('bip39');
const axios = require('axios');
require("dotenv").config();

// <<< PERUBAHAN 1: Buat daftar semua node/server di sini
const PI_NODES = [
    'http://4.194.35.14:31401',
    'http://113.160.156.51:31401',
    // Anda bisa menambahkan lebih banyak server di sini di masa depan
];

async function getPiWalletAddressFromSeed(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic");
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivationPath = "m/44'/314159'/0'";
    const { key } = ed25519.derivePath(derivationPath, seed.toString('hex'));
    const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    console.log("🚀 Public Key (Sender Pi Wallet Address):", keypair.publicKey());
    return { publicKey, secretKey };
}

// <<< PERUBAHAN 2: Fungsi baru untuk mencari server yang aktif
async function findWorkingServer() {
    for (const nodeUrl of PI_NODES) {
        try {
            console.log(`📡 Mencoba menghubungkan ke node: ${nodeUrl}`);
            const server = new StellarSdk.Server(nodeUrl, { allowHttp: true });
            // Lakukan pengecekan sederhana untuk memastikan server merespons
            await server.fetchTimebounds(1); 
            console.log(`✅ Berhasil terhubung ke ${nodeUrl}`);
            return server; // Kembalikan server yang berfungsi
        } catch (error) {
            console.warn(`⚠️ Gagal terhubung ke ${nodeUrl}. Mencoba node berikutnya...`);
        }
    }
    // Jika semua server gagal
    return null;
}


async function sendPi() {
    // <<< PERUBAHAN 3: Gunakan fungsi findWorkingServer untuk mendapatkan server yang aktif
    const server = await findWorkingServer();

    if (!server) {
        console.error('❌ Semua node Pi tidak dapat dijangkau. Mencoba lagi sebentar...');
        console.log(`-------------------------------------------------------------------------------------`);
        setTimeout(sendPi, 1000); // Jika semua gagal, tunggu 5 detik sebelum mencoba lagi
        return;
    }

    const mnemonic = process.env.MNEMONIC;
    const recipient = process.env.RECEIVER_ADDRESS;
    const wallet = await getPiWalletAddressFromSeed(mnemonic);
    const senderSecret = wallet.secretKey;
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const senderPublic = wallet.publicKey;

    // <<< PERUBAHAN 4: Buat URL API dinamis berdasarkan server yang berhasil terhubung
    const workingNodeUrl = server.serverURL.href;
    const apiUrl = `${workingNodeUrl}accounts/${senderPublic}`;

    try {
        const account = await server.loadAccount(senderPublic);
        const baseFee = await server.fetchBaseFee();
        const fee = (baseFee * 2).toString();
        console.log(`⛽ Base Fee: ${baseFee / 1e7}, Doubled Fee: ${fee / 1e7}`);

        const res = await axios.get(apiUrl);
        const balance = res.data.balances[0].balance;
        console.log(`Pi Balance: ${balance}`);

        const withdrawAmount = Number(balance) - 2;
        if (withdrawAmount <= 0) {
            console.log("⚠️ Saldo tidak cukup untuk mengirim. Melewati...");
            console.log(`-------------------------------------------------------------------------------------`)
        } else {
            const formattedAmount = withdrawAmount.toFixed(7).toString();
            console.log(`➡️ Mengirim: ${formattedAmount} Pi`);

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

            if (result && result.transaction_hash !== false) {
                console.log("✅ Tx Hash:", result.hash);
                console.log(`🔗 Lihat Tx: https://blockexplorer.minepi.com/mainnet/transactions/${result.hash}`);
            } else {
                console.log("⚠️ Transaksi dikirim tetapi tidak terkonfirmasi:", result);
            }
            console.log(`-------------------------------------------------------------------------------------`);
        }
    } catch (e) {
        console.error('❌ Error:', e.response?.data?.extras?.result_codes || e.message || e);
        console.log(`-------------------------------------------------------------------------------------`);
    } finally {
        setTimeout(sendPi, 100); // Jalankan lagi setelah 100 ms
    }
}

sendPi(); // Mulai loop

// Free Source Code
// PI auto Transfer bot
// telegram: @zendshost
