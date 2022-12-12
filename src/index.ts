import { BotClient } from "./core/BotClient";
import { getConfig } from "./core/Config";
import { Database } from "./core/Database";

async function main(): Promise<void> {
    const config = getConfig("config.json");
    if (!config) {
        return;
    }

    const database = new Database(config.database);
    await database.connect();

    const client = new BotClient(config, database, config.options);
    await client.login(config.token);
}

main();
