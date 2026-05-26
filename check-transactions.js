// Check Recent Transactions from Database
// این اسکریپت تراکنش‌های اخیر را از دیتابیس نمایش می‌دهد

const FaucetDatabase = require('./database');
const path = require('path');

async function checkRecentTransactions() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🔍 بررسی تراکنش‌های اخیر از دیتابیس');
    console.log('═══════════════════════════════════════════════════════\n');

    const db = new FaucetDatabase();
    await db.initialize();

    // دریافت 20 تراکنش اخیر
    const transactions = db.getAllTransactions(20, 0);

    if (transactions.length === 0) {
        console.log('❌ هیچ تراکنشی یافت نشد!\n');
        db.close();
        return;
    }

    console.log(`✅ ${transactions.length} تراکنش یافت شد:\n`);
    console.log('═══════════════════════════════════════════════════════\n');

    transactions.forEach((tx, index) => {
        console.log(`📝 تراکنش #${index + 1}:`);
        console.log(`   ID: ${tx.id}`);
        console.log(`   نوع: ${tx.type}`);
        console.log(`   آدرس: ${tx.address}`);
        console.log(`   مقدار: ${tx.amount} satoshis (${(tx.amount / 100000000).toFixed(8)} BTC)`);
        console.log(`   وضعیت: ${tx.status}`);

        if (tx.tx_hash) {
            console.log(`   TX Hash: ${tx.tx_hash}`);
            console.log(`   🔗 لینک: https://mempool.space/testnet/tx/${tx.tx_hash}`);
        } else {
            console.log(`   ⚠️  TX Hash موجود نیست (تراکنش ممکن است ارسال نشده باشد)`);
        }

        console.log(`   تاریخ: ${tx.created_at}`);

        if (tx.note) {
            console.log(`   یادداشت: ${tx.note}`);
        }

        console.log('');
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('  📊 آمار کلی');
    console.log('═══════════════════════════════════════════════════════\n');

    const stats = db.getStatistics();
    console.log(`کل تراکنش‌ها: ${stats.total_claims}`);
    console.log(`تراکنش‌های موفق: ${stats.successful_claims}`);
    console.log(`کل ارسال شده: ${(stats.total_sent / 100000000).toFixed(8)} BTC`);
    console.log(`کل دریافت شده: ${(stats.total_received / 100000000).toFixed(8)} BTC`);
    console.log('');

    // یافتن تراکنش‌های تایید نشده (pending)
    const pendingTxs = transactions.filter(tx => tx.status === 'pending');
    if (pendingTxs.length > 0) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ⚠️  تراکنش‌های در انتظار (Pending)');
        console.log('═══════════════════════════════════════════════════════\n');

        pendingTxs.forEach(tx => {
            console.log(`🔄 تراکنش ID ${tx.id}:`);
            console.log(`   آدرس: ${tx.address}`);
            console.log(`   مقدار: ${tx.amount} sats`);
            console.log(`   تاریخ: ${tx.created_at}`);
            if (tx.tx_hash) {
                console.log(`   بررسی در: https://mempool.space/testnet/tx/${tx.tx_hash}`);
            }
            console.log('');
        });
    }

    // یافتن تراکنش‌های شکست خورده
    const failedTxs = transactions.filter(tx => tx.status === 'failed');
    if (failedTxs.length > 0) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ❌ تراکنش‌های شکست خورده');
        console.log('═══════════════════════════════════════════════════════\n');

        failedTxs.forEach(tx => {
            console.log(`💥 تراکنش ID ${tx.id}:`);
            console.log(`   آدرس: ${tx.address}`);
            console.log(`   مقدار: ${tx.amount} sats`);
            console.log(`   تاریخ: ${tx.created_at}`);
            console.log('');
        });
    }

    console.log('═══════════════════════════════════════════════════════\n');

    db.close();
}

checkRecentTransactions().catch(error => {
    console.error('❌ خطا:', error.message);
    process.exit(1);
});
