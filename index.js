const Discord = require('discord.js');
const fs = require("fs");
const config = require("./config.json");
const sqlite3 = require('sqlite3').verbose();
const Canvas = require('canvas');
const { registerFont } = require('canvas');
const path = require('path');
const { Intents, AttachmentBuilder } = require('discord.js');

// Dependencias cargadas y configuración básica

// fuentes
const fontPath = './fonts/Exo-Bold.ttf';
const fontPath2 = './fonts/MedievalSharp-Regular.ttf';


// Registrar la fuente
registerFont(fontPath, { family: 'Exo' });
registerFont(fontPath2, { family: 'Medieval' });


// Declarar un mapa para realizar un seguimiento de las reacciones de los usuarios
const userReactions = new Map();
const dbSugerencias = new sqlite3.Database('./sugerencias.db');

const Client = new Discord.Client({
    intents: 3276799,
});

const { MessageActionRow, MessageButton } = require('discord.js'); // Agregamos la importación de MessageActionRow y MessageButton
const prefix = '/'; // Puedes cambiar esto según tu preferencia


// Cliente de discord
Client.on('ready', async (Client) => {
    console.log(`Logged in as ${Client.user.tag}!`);
    Client.user.setActivity('RenegadosEU', {type: 1});
});


const welcomeCanvas = {};
welcomeCanvas.create = Canvas.createCanvas(1024, 500);
welcomeCanvas.context = welcomeCanvas.create.getContext('2d');
welcomeCanvas.context.font = '72px Medieval';
welcomeCanvas.context.fillStyle = '#ffffff';

Canvas.loadImage("./img/bn2.jpg").then(async (img) => {
    welcomeCanvas.context.drawImage(img, 0, 0, 1024, 500);
    // Calcular el centro horizontal del canvas
    const centerX = welcomeCanvas.create.width / 2;
    // Calcular la anchura del texto "Bienvenido"
    const textWidth = welcomeCanvas.context.measureText("Bienvenido").width;
    // Calcular la posición horizontal para centrar el texto
    const textX = centerX - textWidth / 2;
    // Dibujar el texto "Bienvenido" centrado
    welcomeCanvas.context.fillText("Bienvenido", textX, 360);
    
    welcomeCanvas.context.beginPath();
    welcomeCanvas.context.arc(512, 166, 128, 0, Math.PI * 2, true);
    welcomeCanvas.context.stroke();
    welcomeCanvas.context.fill();

    console.log("Canvas cargado con éxito.");
}).catch(error => {
    console.error("Error al cargar la imagen:", error);
});

Client.on('guildMemberAdd', async member => {
    const welcomechannel = member.guild.channels.cache.get('1204025220269084683');
    let canvas = welcomeCanvas;
    const centerX = canvas.create.width / 2; // Calcular el centro horizontal del canvas

    // Configurar el texto de bienvenida
    canvas.context.font = '42px Exo';
    canvas.context.textAlign = 'center';
    canvas.context.fillStyle = '#ffffff';
    canvas.context.fillText(member.user.tag, centerX, 410);

    // Configurar el texto de "Eres el miembro número..."
    canvas.context.font = '32px Exo';
    canvas.context.fillText(`Eres el miembro número ${member.guild.memberCount}`, centerX, 455);

    // Recortar el área del avatar en un círculo
    canvas.context.beginPath();
    canvas.context.arc(centerX, 166, 119, 0, Math.PI * 2, true);
    canvas.context.closePath();
    canvas.context.clip();

    // Cargar e dibujar el avatar del usuario
    await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 1024 }))
        .then(img => {
            const avatarX = centerX - 119; // Calcular la posición horizontal del avatar
            const avatarY = 47; // La posición vertical del avatar
            canvas.context.drawImage(img, avatarX, avatarY, 238, 238);
            console.log("Imagen de usuario cargada con éxito.");
        }).catch(error => {
            console.error("Error al cargar la imagen de usuario:", error);
        });

    // Construir el archivo adjunto
    const atta = new Discord.AttachmentBuilder(canvas.create.toBuffer(), `welcome-${member.id}.png`);

    // Enviar el mensaje con el archivo adjunto
    try {
        welcomechannel.send({ content: `:wave: Bienvenido ${member} a ${member.guild.name}!`, files: [atta] });
        console.log("Mensaje y archivo adjunto enviados con éxito.");
    } catch (error) {
        console.error(error);
    }
});


// cargar comandos
Client.commands = new Discord.Collection();

fs.readdirSync("./slash_commands").forEach((commandfile) => {
    const command = require(`./slash_commands/${commandfile}`);
    Client.commands.set(command.data.name, command);
});

//registar comandos
const REST = new Discord.REST().setToken(config.CLIENT_TOKEN);

(async () => {
    try {
        // Se envían todos los comandos al servidor
        await REST.put(
            Discord.Routes.applicationGuildCommands(config.clientId, config.guildId),
            {
                body: Client.commands.map((cmd) => cmd.data.toJSON()),
            }
        );
        console.log(`Loaded ${Client.commands.size} slash commands {/}`);
    } catch (error) {
        console.log("Error loading commands.", error);
    }
})();


Client.on('guildMemberAdd', async member => {
    try {
        // Obtener el rol "Renegados Naked"
        const role = member.guild.roles.cache.find(role => role.name === 'Renegados Naked');
        
        // Verificar si el rol existe
        if (role) {
            // Asignar el rol al nuevo miembro
            await member.roles.add(role);
            console.log(`Rol "${role.name}" asignado a ${member.user.tag}.`);
        } else {
            console.log('El rol "Renegados Naked" no existe en el servidor.');
        }
    } catch (error) {
        console.error('Error al asignar el rol:', error);
    }
});



// Evento interactionCreate: Se ejecuta cuando un usuario de la comunidad utiliza una intera
Client.on("interactionCreate", async (interaction) => {
    // Si la interacción es un slash commands
    if (interaction.isChatInputCommand()) {
        // Obtiene los datos del comando
        const command = Client.commands.get(interaction.commandName);
        // Ejecuta el comando
        command.execute(interaction).catch(console.error);
    } else {
        // Si la interacción no es un slash command (botones, menus, etc...)
    }
});




// Evento messageReactionAdd: Se ejecuta cuando un usuario reacciona a un mensaje
Client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    // Verificar si el usuario ya ha reaccionado a este mensaje
    const userKey = `${reaction.message.id}_${user.id}`;
    if (userReactions.has(userKey)) {
        // Si el usuario ya ha reaccionado, puedes ignorar la acción o eliminar la reacción adicional
        reaction.users.remove(user);
        // Puedes agregar un mensaje de advertencia aquí si lo deseas
        console.log(`El usuario ${user.username} ya ha reaccionado a este mensaje.`);
        return;
    }

    // Agregar la reacción del usuario al mapa
    userReactions.set(userKey, user.id);

    
    if (reaction.message.channel.name === 'sugerencias') {
        if (reaction.emoji.name === '👍') {
            dbSugerencias.run('UPDATE sugerencias SET votos_positivos = votos_positivos + 1 WHERE mensaje_id = ?', [reaction.message.id], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } else if (reaction.emoji.name === '👎') {
            dbSugerencias.run('UPDATE sugerencias SET votos_negativos = votos_negativos + 1 WHERE mensaje_id = ?', [reaction.message.id], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
});



// Evento messageReactionRemove: Se ejecuta cuando un usuario elimina su reacción a un mensaje
Client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    // Verificar si el usuario ya ha eliminado su reacción de este mensaje
    const userKey = `${reaction.message.id}_${user.id}`;
    if (!userReactions.has(userKey)) {
        // Si el usuario no ha reaccionado antes, ignorar la acción
        console.log(`El usuario ${user.username} no ha reaccionado a este mensaje.`);
        return;
    }

    // Eliminar la reacción del usuario del mapa
    userReactions.delete(userKey);


    if (reaction.message.channel.name === 'sugerencias') {
        if (reaction.emoji.name === '👍') {
            dbSugerencias.run('UPDATE sugerencias SET votos_positivos = votos_positivos - 1 WHERE mensaje_id = ?', [reaction.message.id], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } else if (reaction.emoji.name === '👎') {
            dbSugerencias.run('UPDATE sugerencias SET votos_negativos = votos_negativos - 1 WHERE mensaje_id = ?', [reaction.message.id], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
});



// Embed Ticket Español
const embedEs = {
    title: '**RenegadosRust.com Support**',
    url: 'https://renegadosrust.com/',
    description: '__**¡Bienvenido al panel de ayuda!**__\n\nSi __**habla español**__ haga **clic** en el **botón** a continuación si desea hablar con el equipo de soporte. Ellos responderán a su solicitud __**lo antes posible**__.',
    color: 0x10ebd6,
    thumbnail: { url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' },
    footer: {
        text: 'Made by RenegadosSupport',
        icon_url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' // Opcional: URL del icono del pie de página
    }
};


// Embed Ticket Ingles
const embedEn = {
    title: '**RenegadosRust.com Support**',
    url: 'https://renegadosrust.com/',
    description: '__**¡Welcome to the help panel!**__\n\nIf __**you speak English**__, please **click** the **button** below if you want to talk to the support team. They will respond to your request __**as soon as possible**__.',
    color: 0x10ebd6,
    thumbnail: { url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' },
    footer: {
        text: 'Made by RenegadosSupport',
        icon_url: 'https://cdn.discordapp.com/attachments/1212713648854794240/1215020602730217502/NOTIENEFONDOPEROERACISTA.png?ex=65fb3b1d&is=65e8c61d&hm=511a0698140f3494be9068914621611ef0d5ab4f63d1d160fec8aab3152c8e0d&' // Optional: Footer icon URL
    }
};


// Menu Español
const menuEs = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
         .setPlaceholder('Abre un Ticker de soporte')
         .setMaxValues(1)
         .setMinValues(1)
         .setCustomId('ticket-crear')
         .setOptions([{
        label: 'Soporte',
        emoji: '👋',
        description: 'Abre un ticket de soporte',
        value: 'Soporte'
    }, {
        label: 'Reportes',
        emoji: '⚠️',
        description: 'Abre un ticket de reporte',
        value: 'Reporte'
    }])
);


// Menu Embed Ingles
const menuEn = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
         .setPlaceholder('Open a support ticket')
         .setMaxValues(1)
         .setMinValues(1)
         .setCustomId('ticket-create')
         .setOptions([{
        label: 'Support',
        emoji: '👋',
        description: 'Open a support ticket',
        value: 'Support'
    }, {
        label: 'Reports',
        emoji: '⚠️',
        description: 'Open a report ticket',
        value: 'Report'
    }])
);


// comenta esto si ya tengo el mensaje enviado


Client.on('ready', async (client) => {
    const ticketPanelChannelId = "1212530317240442931"// id del canal
    client.channels.fetch(ticketPanelChannelId)
    .then(channel => channel.send({embeds: [embedEs], components: [menuEs]}))
});

Client.on('ready', async (client) => {
    const ticketPanelChannelId = "1212530317240442931"// id del canal
    client.channels.fetch(ticketPanelChannelId)
    .then(channel => channel.send({embeds: [embedEn], components: [menuEn]}))
});



/// Evento Interaction Create

Client.on("interactionCreate", async (interaction) => {
    if(interaction.isChatInputCommand()) return;
    
    try {
        const execute = require(`./interactions/${interaction.customId}`);
        execute(interaction);
    }  catch (error) {
        console.log('error')
    }

});



// Conexion
