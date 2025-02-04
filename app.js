// app.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const helmet = require('helmet');
const axios = require('axios');

/* ------------------------- */
/* ----- Logger Setup ------ */
/* ------------------------- */
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  debug: (...args) => console.log('[DEBUG]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

/* ------------------------- */
/* ----- State Store ------- */
/* ------------------------- */
const stateFilePath = path.join(__dirname, 'user_state.json');

function readState() {
  try {
    if (!fs.existsSync(stateFilePath)) {
      return {};
    }
    const data = fs.readFileSync(stateFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('Erreur de lecture du state:', error);
    return {};
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
  } catch (error) {
    logger.error('Erreur d\'écriture du state:', error);
  }
}

/* ------------------------- */
/* ----- Providers IA ------ */
/* ------------------------- */
class OpenAIProvider {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.endpoint = 'https://api.openai.com/v1/completions';
  }
  async getResponse(prompt) {
    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: 'text-davinci-003',
          prompt,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].text.trim();
    } catch (error) {
      logger.error('Erreur avec OpenAI:', error);
      return null;
    }
  }
}

class AnthropicProvider {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.endpoint = 'https://api.anthropic.com/v1/completions';
  }
  async getResponse(prompt) {
    try {
      return `Réponse de Anthropic pour: ${prompt}`;
    } catch (error) {
      logger.error('Erreur avec Anthropic:', error);
      return null;
    }
  }
}

/* ------------------------- */
/* ------ Listeners -------- */
/* ------------------------- */
function loadCommands(app, aiProviders) {
  app.command('/ask-advanced', async ({ command, ack, say }) => {
    await ack();
    const question = command.text;
    logger.debug(`Commande reçue: ${question}`);
    try {
      if (!question || !question.trim()) {
        throw new Error('La question est vide');
      }
      logger.info(`Appel à OpenAI avec la question: ${question}`);
      const response = await aiProviders.openai.getResponse(question);
      if (!response) {
        throw new Error('Réponse IA vide');
      }
      logger.debug(`Réponse générée: ${response}`);
      await say(`Réponse IA: ${response}`);
    } catch (error) {
      logger.error(`Erreur lors de la génération de la réponse IA: ${error.message}`);
      await say("Désolé, une erreur est survenue lors du traitement de votre requête.");
    }
  });
}

function loadEvents(app) {
  app.event('app_mention', async ({ event, say }) => {
    try {
      await say(`Bonjour <@${event.user}> ! Comment puis-je vous aider ?`);
    } catch (error) {
      logger.error('Erreur dans l\'événement app_mention:', error);
    }
  });
}

function loadActions(app) {
  app.action('action_id_exemple', async ({ body, ack, say }) => {
    await ack();
    await say(`Action déclenchée par <@${body.user.id}>`);
  });
}

/* ------------------------- */
/* -- Configuration Slack -- */
/* ------------------------- */
logger.info('Initialisation de l\'application Slack...');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events'
});
logger.debug('ExpressReceiver créé avec succès');

receiver.app.use(helmet());
receiver.app.use(express.json());

receiver.app.use((req, res, next) => {
  logger.info(`Requête entrante: ${req.method} ${req.url}`);
  next();
});

receiver.app.use((err, req, res, next) => {
  logger.error(`Erreur dans le middleware: ${err.message}`);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  receiver
});
logger.debug('Application Slack Bolt initialisée');

/* ------------------------- */
/* --- Chargement Listeners - */
/* ------------------------- */
logger.info('Chargement des listeners Slack...');
try {
  const aiProviders = {
    openai: new OpenAIProvider(),
    anthropic: new AnthropicProvider()
  };
  logger.info('Providers IA initialisés');

  loadCommands(slackApp, aiProviders);
  loadEvents(slackApp);
  loadActions(slackApp);
  logger.debug('Listeners Slack chargés');
} catch (error) {
  logger.error('Erreur lors du chargement des listeners:', error);
}

/* ------------------------- */
/* --- Endpoint Webhook ---- */
/* ------------------------- */
receiver.app.post('/webhook', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error('Requête Webhook vide');
    }
    logger.info(`Webhook reçu: ${JSON.stringify(req.body)}`);
    res.status(200).send({ status: 'OK' });
  } catch (error) {
    logger.error('Erreur Webhook:', error);
    res.status(500).send({ error: 'Erreur interne' });
  }
});

/* ------------------------- */
/* ----- Démarrage App ----- */
/* ------------------------- */
(async () => {
  try {
    const port = process.env.PORT || 3000;
    logger.info(`Démarrage de l'application Slack sur le port ${port}...`);
    await slackApp.start(port);
    logger.info(`⚡️ Application Slack avancée en ligne sur le port ${port}!`);
  } catch (error) {
    logger.error('Erreur au démarrage:', error);
    process.exit(1);
  }
})();