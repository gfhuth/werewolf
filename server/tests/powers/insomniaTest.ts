import { Client, Role } from "../main.test";
import { test } from "../test-api/testAPI";

export const insomniaTest = async (insomnia: Client, players: Array<Client>): Promise<void> => {
    if (!insomnia) return;

    await test("Test insomnia", async (t) => {
        t.equal(insomnia.getRole(), Role.HUMAN);
    });
};
