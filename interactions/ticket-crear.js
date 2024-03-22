const Discord = require('discord.js');


const embed = {
    title: '__**Bienvenido a tu ticket**__',
    url: 'https://renegadosrust.com/',
    description: '¡Indique su **problema** y espere hasta que un miembro del equipo de soporte venga a ayudarlo!\n\nSi has abierto el ticket **por error** o tu problema ya se ha **resuelto** por favor pulsa en el botón de **cerrar ticket**.',
    color: 0x10ebd6,
    thumbnail: { url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' },
    footer: {
        text: 'Made by RenegadosSupport',
        icon_url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' // Opcional: URL del icono del pie de página
    }
};

const guildTicketCategoryId = '1219700748581998602'; //reemplaza
const moderationRole = '1212709064958550088';//reemplaza



const ticketCloseButton = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
    .setCustomId('ticket-cerrar')
    .setLabel('Cerrar ticket')
    .setStyle('2')
    .setEmoji('🔒')
)

async function main (interaction) {
    const {user, guild} = interaction;
    const ticketType = interaction.values[0];

    const tickets = guild.channels.cache.filter(channel => channel.parentId === guildTicketCategoryId);
    if(tickets.some(ticket => ticket.topic === user.id)) return interaction.reply({content: 'Ya tienes un ticket abierto.', ephemeral: true})

    // Creacion de ticket
    interaction.reply({content: 'Tu ticket se esta creando...', ephemeral: true})
    .then(() => {
        guild.channels.create({
            name: ticketType+'-'+user.username.slice(0, 25-ticketType.length),
            topic: user.id,
            type: Discord.ChannelType.GuildText,
            parent: guildTicketCategoryId,
            permissionOverwrites: [
                {id: interaction.guild.roles.everyone, deny: [Discord.PermissionsBitField.Flags.ViewChannel]},
                {id: moderationRole, allow: [Discord.PermissionsBitField.Flags.ViewChannel]},
                {id: interaction.user.id, allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages]},
                      ]
        }).then(channel => {
            interaction.editReply({content: `- Tu ticket ha sido creado: ${channel}`});

            channel.send({
                embeds: [embed],
                components: [ticketCloseButton]
            });
        });
        
    });

};

module.exports = main;