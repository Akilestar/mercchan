const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { default: Axios } = require('axios');
require('dotenv').config();
const APIKey = process.env.IGDB_API_KEY;
const axios = require('axios');
const dayjs = require('dayjs');

module.exports = class eventCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'event',
      aliases: ['party', 'tournament'],
      group: 'other',
      memberName: 'event',
      description: 'Announces a server event',
      examples: ['!event "game" "number of players" "day" "time"'],
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      args: [
        {
          key: 'queryGame',
          prompt: 'What game would you like to play?',
          type: 'string',
        },
        {
          key: 'queryEventCapacity',
          prompt: 'How many players?',
          type: 'integer',
        },
        {
          key: 'queryEventDay',
          prompt: 'What Day?',
          type: 'string',
        },
        {
          key: 'queryEventTime',
          prompt: 'What Time?',
          type: 'string',
        },
      ],
    });
  }

  hasPermission(message) {
    const approvedRoles = ['🛡 Division Commander', '⚔️ Commander'];
    const title = message.member.roles.highest.name;
    if (approvedRoles.includes(title)) return true;
    return 'Only Division Commanders and above may create events.';
  }

  async run(
    message,
    { queryGame, queryEventCapacity, queryEventDay, queryEventTime }
  ) {
    let eventDate;
    queryEventDay.toLowerCase();
    if (queryEventDay.toLowerCase() === 'today') {
      eventDate = dayjs().format('MM/DD/YYYY');
      //console.log(eventDate);
    } else if (queryEventDay.toLowerCase() === 'tomorrow') {
      eventDate = dayjs().add(1, 'day').format('MM/DD/YYYY');
      //console.log(eventDate);
    } else {
      eventDate = dayjs(queryEventDay)
        .year(dayjs().year())
        .format('MM/DD/YYYY');
      //console.log(eventDate);
    }
    let eventTime;
    const eventTimePeriod =
      queryEventTime[queryEventTime.length - 2] +
      queryEventTime[queryEventTime.length - 1];
    if (!queryEventTime.includes(':')) {
      eventTime = queryEventTime.replace(
        eventTimePeriod,
        `:00 ${eventTimePeriod}`
      );
    } else {
      eventTime = queryEventTime.replace(
        eventTimePeriod,
        ` ${eventTimePeriod}`
      );
    }
    eventTime = dayjs(`${eventDate} ${eventTime}`).format('h:mm A');
    console.log(eventTime);

    const embed = new MessageEmbed();
    const baseURL = 'https://api-v3.igdb.com';
    await axios
      .get(`${baseURL}/games`, {
        headers: {
          'user-key': APIKey,
          'contenct-type': 'application/json',
        },
        params: {
          fields: 'name, cover.url',
          search: queryGame,
        },
      })
      .then((response) => {
        embed.setTitle(`${queryGame} Event`);
        if (response.data.length > 0) {
          const coverart = `https:${response.data[0].cover.url}`;
          embed.setThumbnail(coverart);
        }
        embed.setColor('#bb070e');
        embed.addFields(
          {
            name: 'When:',
            value: dayjs(eventDate).format('dddd, MMM D'),
            inline: true,
          },
          {
            name: '\u200b',
            value: eventTime,
            inline: true,
          }
        );
        embed.addField('Number of Players:', queryEventCapacity);
        embed.addField('\u200b', 'Drop us an emoji if you can make it');
        embed.setFooter(`Event created by: ${message.author.username}`);
      })
      .catch((error) => {
        console.log('Something went wrong');
      });
    message.embed(embed);
  }
};
