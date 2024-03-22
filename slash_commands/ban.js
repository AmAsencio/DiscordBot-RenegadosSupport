const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banea a un usuario del servidor")
        .addUserOption(option => option
            .setName("usuario")
            .setDescription("Usuario que quieres banear")
            .setRequired(true)) // Establecer como obligatoria
        .addStringOption(option => option
            .setName("razón")
            .setDescription("Razón del ban")
            .setRequired(true)) // Establecer como obligatoria
        .setDMPermission(false),

    async execute(interaction) {
        
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({
            content: `No tienes permiso para usar este comando!`,
            ephemeral: true
        });

        const { options } = interaction;
        const userOption = options.getUser("usuario");
        const userIdOption = options.getString("user_id");
        const reason = options.getString("razón");

        let memberToBan;

        if (userOption) {
            memberToBan = userOption;
        } else if (userIdOption) {
            try {
                memberToBan = await interaction.client.users.fetch(userIdOption);
            } catch (error) {
                console.error(error);
                return await interaction.reply("Ningún usuario encontrado!");
            }
        } else {
            return await interaction.reply("No has introducido ningun user_id que banear!");
        }

        if (memberToBan, memberToBan.id === interaction.user.id) {
            return await interaction.reply("No te puedes banear a ti mismo!");
        }

        try {
            const banOptions = { reason };
            const guildMember = interaction.guild.members.cache.get(memberToBan.id);

            if (guildMember) {
                if (guildMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    return await interaction.reply(`No puedes banear a ${guildMember.user} porque tiene un rol igual o superior al tuyo!`);
                }

                await guildMember.ban(banOptions);
            } else {
                await interaction.guild.bans.create(memberToBan, banOptions);
            }

            const embed = new EmbedBuilder()
                .setDescription(`${memberToBan} usuario baneado correctamente!`)
                .setTitle("Ban")
                .setColor("#ffffff")
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp()
                .addFields({ name: 'Razón', value: `${reason || "No razón"}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply("Un error ocurió al banear!");
              
        }
    }
};