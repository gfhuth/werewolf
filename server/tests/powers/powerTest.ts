import { Client, Power } from "../main.test";
import { test } from "../test-api/testAPI";

export const powersTest = async (players: Array<Client>, clairvoyance: Client, contamination: Client, clientNotInGame: Client): Promise<void> => {
    await test("Player don't have any power", async (t) => {
        const player: Client = players.filter((p) => p.getPower() === Power.NO_POWER)[0];
        player.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CONTAMINATION",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        await t.testOrTimeout(
            player.verifyEvent({
                event: "POWER_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Player don't have any power"
                }
            })
        );
    });

    await test("Player has already used his power", async (t) => {
        if (clairvoyance) {
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

            await t.testOrTimeout(
                clairvoyance.verifyEvent({
                    event: "POWER_ERROR",
                    game_id: 1,
                    data: {
                        status: 403,
                        message: "Player has already used his power"
                    }
                })
            );
        }
    });

    await test("Target not in the game", async (t) => {
        if (contamination) {
            contamination.sendMessage(
                JSON.stringify({
                    event: "USE_POWER_CONTAMINATION",
                    game_id: 1,
                    data: {
                        target: clientNotInGame.getName()
                    }
                })
            );

            await t.testOrTimeout(
                contamination.verifyEvent({
                    event: "POWER_ERROR",
                    game_id: 1,
                    data: {
                        status: 403,
                        message: "Target player is not in the game"
                    }
                })
            );
        }
    });
};
