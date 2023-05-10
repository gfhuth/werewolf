import { Client } from "../main.test";
import { test } from "../test-api/testAPI";

export const clairvoyancePower = async (clairvoyance: Client, players: Array<Client>): Promise<void> => {
    if (!clairvoyance) return;

    await test("Test clairvoyance", async (t) => {
        const player: Client = players[Math.floor(Math.random() * players.length)];
        clairvoyance.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CLAIRVOYANCE",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        clairvoyance.reinitExpectedEvents();
        clairvoyance.addExpectedEvent({
            event: "CLAIRVOYANCE_RESPONSE",
            game_id: 1,
            data: {
                role: player.getRole(),
                power: player.getPower()
            }
        });
        await t.testOrTimeout(clairvoyance.verifyEvent());
    });
};
