import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

let player: Client;

export const testContamination = async (contamination: Client, players: Array<Client>): Promise<void> => {
    if (!contamination) return;
    player = players.filter((p) => p.getRole() === Role.HUMAN)[0];

    await test("Test contamination", async (t) => {
        t.equal(contamination.getRole(), Role.WEREWOLF);

        contamination.sendMessage(
            JSON.stringify({
                event: "USE_POWER_CONTAMINATION",
                game_id: 1,
                data: {
                    target: player.getName()
                }
            })
        );
        player.log();
    });
};

export const verifyContamination = async (): Promise<void> => {
    await test("Verify contamination applied", async (t) => {
        t.equal(player.getRole(), Role.WEREWOLF);
    });
};
