const { Telegraf } = require('telegraf');
require('dotenv').config();

async function testBot() {
    const token = '7568497306:AAGce4VW-60OUyoImSxQB-d5H7kyI3503rQ';
    console.log('Testing bot with token:', token.substring(0, 10) + '...');
    
    try {
        const bot = new Telegraf(token);
        
        // Try to get bot info
        const botInfo = await bot.telegram.getMe();
        console.log('Bot info:', botInfo);
        
        // Set up a simple message handler
        bot.on('text', (ctx) => {
            console.log('Received message:', ctx.message.text);
            return ctx.reply('Test reply: ' + ctx.message.text);
        });
        
        console.log('Starting bot...');
        await bot.launch();
        console.log('Bot started successfully!');
        
        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (error) {
        console.error('Error testing bot:', error);
    }
}

testBot().catch(console.error);
