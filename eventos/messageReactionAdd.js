const sqlite3 = require('sqlite3').verbose();
const dbSugerencias = new sqlite3.Database('./sugerencias.db');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    if (reaction.message.channel.name === 'sugerencias') {
      console.log(`Se ha registrado una reacción en el mensaje ID: ${reaction.message.id}`);
      console.log(`Emoji de la reacción: ${reaction.emoji.name}`);

      if (reaction.emoji.name === '👍') {
        console.log('Se ha reaccionado con 👍');

      } else if (reaction.emoji.name === '👎') {
        console.log('Se ha reaccionado con 👎');

      }
    }
  },
};
