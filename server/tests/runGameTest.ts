import { client0, client1, client2, client3, client4, client5, client6, client7, client8, client9 } from "./usersTest";

const testTiming = 2;

export const testRunGame = (): void =>
    describe("Run of a game", () => {
        beforeAll(async () => {
            client0.setWebsocketConnection();
            await client0.connect();
        });

        afterAll(() => {
            client0.closeSocket();
        });

        // test("waiting", async () => {
        //     await new Promise((resolve) => setTimeout(resolve, testTiming * 1000));
        // });

        // test("Lancement d'une partie", async () => {
        //     // await client0.controlStartGame(1);
        //     // await client1.controlStartGame(1);
        //     // await client2.controlStartGame(1);
        //     // await client3.controlStartGame(1);
        //     // await client4.controlStartGame(1);
        //     // await client5.controlStartGame(1);
        //     console.log(client0);
        //     console.log(client1);
        //     console.log(client2);
        //     console.log(client3);
        //     console.log(client4);
        //     console.log(client5);
        // });
    });
