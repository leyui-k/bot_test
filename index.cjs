require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, InteractionCollector } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: 'https://cacolombia.com' }));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

new InteractionCollector(client);
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.cjs'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] El comando en ${filePath} le falta la propiedad "data" o "execute".`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.cjs'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

app.post('/post_to_discord', async (req, res) => {
	const { post_id, comment_id, message_id } = req.body;
	console.log(`Solicitud en Discord para el post: ${post_id}, Comentario ID: ${comment_id}, Embed ID: ${message_id}`);
	try {
		const headers = {
			'Authorization': `Token ${process.env.SERVICE_ACCOUNT_TOKEN}`
		};
		const response = await axios.get(`http://localhost:8000/post-info/${post_id}/`, { headers });
		const post = response.data;
		
		// ESTO ES PARA TESTS DESDE MI MAQUINA LOCAL
		const publicUrl = 'https://2d76-50-92-112-54.ngrok-free.app';
		const imageUrl = post.image_url.replace('http://localhost:8000', publicUrl);
		const profileUrl = `http://localhost:8000/profile/${post.user.username}`;
		const profileImageUrl = post.user.profile_image.replace('http://localhost:8000', publicUrl);

		const commentsResponse = await axios.get(`http://localhost:8000/comments/${post_id}/`, { headers });
		const comments = commentsResponse.data;
		const commentsText = comments.map(comment => `${comment.user}: ${comment.text}`).join('\n');

		const webhookData = {
			embeds: [
				{	
					color: 0xFFD966,
					author: {
						name: post.user.username,
						url: profileUrl,
					},
					thumbnail: {
						url: profileImageUrl
					},
					description: post.caption,
					image: {
						url: imageUrl
					},
					fields: [
						{
							name: 'Comentarios',
							value: commentsText || 'Aun no hay comentarios.',
							inline: false
						}
					],
					footer: {
						text: 'ca colombia pene',
					}
				}
			]
		};

		let webhookResponse;
		if (message_id) {
			webhookResponse = await axios.patch(`${process.env.WEBHOOK_URL}/messages/${message_id}?wait=true`, webhookData);
		} else {
			webhookResponse = await axios.post(`${process.env.WEBHOOK_URL}?wait=true`, webhookData);
		}

		console.log(`Webhook status: ${webhookResponse.status}`);
		res.status(200).json({ message_id: webhookResponse.data.id });
	} catch (error) {
		console.error('Error al obtener los detalles del mensaje o al enviarlo a Discord:', error);
		if (error.response) {
			console.error('Error data:', error.response.data );
			console.error('Error status:', error.response.status);
		}
		res.status(500).send('Error al obtener los detalles del mensaje o al enviarlo a Discord');
	}
});

// MySQL Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const FechaSinAño = (dayMonth) => {
    const [day, month] = dayMonth.split('/').map(Number);
    const currentYear = new Date().getFullYear();
    let parsedDate = new Date(currentYear, month - 1, day);
    return parsedDate < new Date() ? new Date(currentYear + 1, month - 1, day) : parsedDate;
};

const HtmlFecha = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
};

const validateDate = (date) => /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(date);

app.post('/api/evento', async (req, res) => {
    const { titulo, date, descripcion, requisitos, image, eventoURL } = req.body;
    if (!date || !validateDate(date)) {
		return res.status(400).json({ error: 'Fecha inválida (DD/MM).' });
	}	

    const parsedDate = FechaSinAño(date);
    const htmlDate = HtmlFecha(parsedDate);
    try {
        const [result] = await db.execute(
            'INSERT INTO eventos (titulo, date, htmlDate, descripcion, requisitos, image, eventoURL) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [titulo, parsedDate.toISOString().split('T')[0], htmlDate, descripcion, requisitos, image, eventoURL]
        );
        res.status(200).json({ message: 'Evento registrado.', evento: { id: result.insertId, titulo, date: htmlDate } });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el evento.' });
    }
});

app.get('/api/evento', async (_, res) => {
    try {
        const [eventos] = await db.execute('SELECT * FROM eventos');
        res.status(200).json({ eventos: eventos.length ? eventos : [] });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener eventos.' });
    }
});

app.get('/api/evento/:id', async (req, res) => {
    try {
        const [eventos] = await db.execute('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
        eventos.length ? 
		res.status(200).json(eventos[0]):
		res.status(404).json({ error: 'Evento no encontrado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el evento.' });
    }
});

app.delete('/api/evento/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id]);
        result.affectedRows ? 
		res.status(200).json({ message: 'Evento eliminado.' }): 
		res.status(404).json({ error: 'Evento no encontrado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el evento.' });
    }
});

const deleteExpiredEvents = async () => {
    try {
        const [result] = await db.execute('DELETE FROM eventos WHERE date < ?', [new Date().toISOString().split('T')[0]]);
        if (result.affectedRows) 
			console.log(`Eventos expirados eliminados: ${result.affectedRows}`);
    } catch (error) {
        console.error('Error al eliminar eventos expirados:', error);
    }
};

setInterval(deleteExpiredEvents, 2 * 24 * 60 * 60 * 1000);
deleteExpiredEvents();

client.on('interactionCreate', async interaction => {
	if (interaction.isAutocomplete()) {
		const command = client.commands.get(interaction.commandName);
		if (!command || !command.autocomplete) return;
		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error('Error autocomplete:', error);
		}
	}
});

app.listen(3001, () => {
	console.log('API escuchando en el puerto 3001');
});

client.login(process.env.tokenBot);