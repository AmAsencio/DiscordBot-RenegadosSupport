const Discord = require('discord.js');



const embed = {
    title: 'Welcome to your ticket',
    url: 'https://renegadosrust.com/',
    description: 'Please indicate your **issue** and wait for a member of the support team to assist you!\n\nIf you have opened the ticket **by mistake** or your issue has already been **resolved**, please press the **close ticket** button.',
    color: 0x10ebd6,
    thumbnail: { url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' },
    footer: {
    text: 'Made by RenegadosSupport',
    icon_url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' // Optional: Footer icon URL
    }
    };

const guildTicketCategoryId = '1219700748581998602'; //reemplaza
const moderationRole = '1212709064958550088';//reemplaza



const ticketCloseButton = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
    .setCustomId('ticket-close')
    .setLabel('Close Ticket')
    .setStyle('2')
    .setEmoji('🔒')
)

async function main (interaction) {
    const {user, guild} = interaction;
    const ticketType = interaction.values[0];

    const tickets = guild.channels.cache.filter(channel => channel.parentId === guildTicketCategoryId);
    if(tickets.some(ticket => ticket.topic === user.id)) return interaction.reply({content: 'You have already One ticket open.', ephemeral: true})

    // Creacion de ticket
    interaction.reply({content: 'Your Ticket is being created...', ephemeral: true})
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
            interaction.editReply({content: `- Your ticket has been created: ${channel}`});

            channel.send({
                embeds: [embed],
                components: [ticketCloseButton]
            });
        });
        
    });

};

module.exports = main;