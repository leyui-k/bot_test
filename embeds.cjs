const Color = 1111005 //Int color 
const cl = 5763719
const countCommands = require('./count-commands.cjs');

const categories = [
    '`🔨 Moderacion 🔭 Utilidades 🏠 Server 🐱 Informacion`'
  ];

const embed = {
    title: "REM | Menu de ayuda",
    description: '',
    color: Color,
    fields: [
      {
        name: '» Menu ayuda',
        value: `Tenemos 2 categorias y ${countCommands()} comandos!`,
      },
      {
        name: '» Categorias',
        value: categories.join('  '), 
      },
    ],
    footer: {
      text: '© JN ',
    },
  };

const embed1 = {
    title: "» Comandos de utilidades",
    description: '',
    color: Color,
    fields: [
      {
        name: '/help',
        value: '**↪︎** Es el mismo comando que estas usando!',
      },
      {
        name: '/avatar',
        value: '**↪︎** Mira el avatar de un usuario!',
      },
    ],
    footer: {
      text: '© JN',
    },
  };

const embed2 = {
    title: "» Comandos server",
    description: '',
    color: Color,
    fields: [
      {
        name: '/evento',
        value: '**↪︎** Crea un evento para la pagina principal de CA Colombia! (Solo staff)',
      },
      {
        name: '/delete-evento',
        value: '**↪︎** Borra un evento de la pagina principal de CA Colombia! (Solo staff)',
      },
    ],
    footer: {
      text: '© JN',
    },
  };

  const embed3 = {
    title: "» Comandos moderacion",
    description: '',
    color: Color,
    fields: [
      {
        name: '/ban',
        value: '**↪︎** Banea un usuario! (Solo staff)',
      },
      {
        name: '/kick',
        value: '**↪︎** Kickea un usuario! (Solo staff)',
      },
    ],
    footer: {
      text: '© JN',
    },
  };

  const ban = {
    title: "Usuario baneado!",
    description: '',
    color: cl,
  };

  const kick = {
    title: "Usuario kickeado!",
    description: '',
    color: cl,
  };

  const error1 = {
    title: "No tienes permisos para banear miembros.",
    description: '',
    color: 16711680,
  };

  const error2 = {
    title: "No tienes permisos para kickear miembros.",
    description: '',
    color: 16711680,
  };
  
  module.exports ={
    categories, embed, embed1, embed2, embed3, ban, kick, error1, error2
}