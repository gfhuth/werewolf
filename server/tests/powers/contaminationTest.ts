import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const contaminationTest = async (contamination: Client, players: Array<Client>): Promise<void> => {
    if (!contamination) return;

    await test("Test contamination", async (t) => {
        t.equal(contamination.getRole(), Role.WEREWOLF);

        const player: Client = players.filter((p) => p.getRole() === Role.HUMAN)[0];
        contamination.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CONTAMINATION",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );

        await t.timeout(player.startPeriod("DAY_STARTS", 1, t), 10000);
        t.equal(player.getRole(), Role.WEREWOLF);
    });
};
