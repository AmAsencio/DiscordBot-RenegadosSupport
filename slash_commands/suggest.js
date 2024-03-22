const { SlashCommandBuilder, client } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const dbSugerencias = new sqlite3.Database('sugerencias.db');
const { EmbedBuilder } = require('discord.js');
dbSugerencias.serialize(() => {
  dbSugerencias.run('CREATE TABLE IF NOT EXISTS sugerencias (usuario_id TEXT, sugerencia TEXT, votos_positivos INTEGER, votos_negativos INTEGER, mensaje_id TEXT)');
});
module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion to improve the server.')
    .addStringOption(option =>
      option.setName('suggest')
        .setDescription('Write your suggestion')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const suggestion = interaction.options.getString('suggest');

   
    dbSugerencias.run('INSERT INTO sugerencias (usuario_id, sugerencia, votos_positivos, votos_negativos, mensaje_id) VALUES (?, ?, 0, 0, ?)', [userId, suggestion, interaction.id], (err) => {
      if (err) {
        console.error(err);
        return interaction.reply('Hubo un error al enviar la sugerencia.');
      }

      const guildLogoURL = 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&';

    
      const authorURL = `https://discord.com/users/${interaction.user.id}`;
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(), // Aquí obtiene el avatar actual del usuario
            url: authorURL,
        })
        .setTitle('__**Nueva Sugerencia de ' + interaction.user.username + '**__')
        .setDescription(`**Sugerencia**:\n\`\`\`${suggestion}\`\`\``)
        .setThumbnail(guildLogoURL) 
        .setFooter({
          text: 'Utiliza /sugerir para enviar tu sugerencia.',
          iconURL: guildLogoURL 
        });

     
      const canalSugerencias = interaction.guild.channels.cache.find(channel => channel.name === '🤔︱sugerencias');
      if (canalSugerencias) {
        canalSugerencias.send({ embeds: [embed] }).then((message) => {
          message.react('👍');
          message.react('👎'); 
        });
      }

      interaction.reply('Your suggestion has been sent successfully.');
    });
  },
};

