# telegram-health-bot
- Diabetes Health Bot

## Description
Telegram Health Check-in Bot
- Minimal Viable Product (MVP) for a Diabetes Health Bot

## Getting started
- You will need to have `Docker` desktop running locally.
- Update your `config/default.json` file, as well as your `.env.example` file with the appropriate properties needed to run the project, which will include the necessary Telegram Bot hook keys.
- Set the Telegram Bot hook to point to your server, or if you're running locally, you will need to use a tool like `ngrok` to expose your `localhost` to the outside world.
- Then run `docker-compose up -d` and you should be up and running locally at `http://localhost:3001`.

