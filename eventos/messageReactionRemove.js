const sqlite3 = require('sqlite3').verbose();
const dbSugerencias = new sqlite3.Database('./sugerencias.db');

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        if (reaction.message.channel.name === 'sugerencias') {
            const originalMessage = reaction.message;
            const embed = originalMessage.embeds[0];

            if (reaction.emoji.name === '👍') {
                

            } else if (reaction.emoji.name === '👎') {
                
        } else {
            console.log('El mensaje no está en el canal de sugerencias.');
        }
    }}
};
