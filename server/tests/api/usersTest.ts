import request from "supertest";
import jwt from "jsonwebtoken";
import { Client, url } from "../main.test";

const password0 = "cjbdzqbczkl";
const password1 = "cjbzceada";
const password2 = "ckldzcnùz";
const password3 = "bcziebcz";
const password4 = "ncoacnaoĉ";
const password5 = "cbuizciq";
const password6 = "copajvppa";
const password7 = "ccjzbbvi";
const password8 = "iabciiczc";
const password9 = "nfzofbpv";

export const testUsers = (
    client0: Client,
    client1: Client,
    client2: Client,
    client3: Client,
    client4: Client,
    client5: Client,
    client6: Client,
    client7: Client,
    client8: Client,
    client9: Client
): void =>
    describe("Test users", () => {
        test("Create users and test whoami", async () => {
            // Test de la création d'un utilisateur
            let res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client0.getName(), password: password0 }));
            const token0 = res.body.token;
            const name0: string = (jwt.decode(token0) as { username: string }).username;
            expect(name0).toEqual(client0.getName());
            client0.setToken(token0);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client1.getName(), password: password1 }));
            const token1 = res.body.token;
            const name1: string = (jwt.decode(token1) as { username: string }).username;
            expect(name1).toEqual(client1.getName());
            client1.setToken(token1);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client2.getName(), password: password2 }));
            const token2 = res.body.token;
            const name2: string = (jwt.decode(token2) as { username: string }).username;
            expect(name2).toEqual(client2.getName());
            client2.setToken(token2);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client3.getName(), password: password3 }));
            const token3 = res.body.token;
            const name3: string = (jwt.decode(token3) as { username: string }).username;
            expect(name3).toEqual(client3.getName());
            client3.setToken(token3);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client4.getName(), password: password4 }));
            const token4 = res.body.token;
            const name4: string = (jwt.decode(token4) as { username: string }).username;
            expect(name4).toEqual(client4.getName());
            client4.setToken(token4);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client5.getName(), password: password5 }));
            const token5 = res.body.token;
            const name5: string = (jwt.decode(token5) as { username: string }).username;
            expect(name5).toEqual(client5.getName());
            client5.setToken(token5);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client6.getName(), password: password6 }));
            const token6 = res.body.token;
            const name6: string = (jwt.decode(token6) as { username: string }).username;
            expect(name6).toEqual(client6.getName());
            client6.setToken(token6);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client7.getName(), password: password7 }));
            const token7 = res.body.token;
            const name7: string = (jwt.decode(token7) as { username: string }).username;
            expect(name7).toEqual(client7.getName());
            client7.setToken(token7);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client8.getName(), password: password8 }));
            const token8 = res.body.token;
            const name8: string = (jwt.decode(token8) as { username: string }).username;
            expect(name8).toEqual(client8.getName());
            client8.setToken(token8);

            // Création d'un autre utilisateur
            res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client9.getName(), password: password9 }));
            const token9 = res.body.token;
            const name9: string = (jwt.decode(token9) as { username: string }).username;
            expect(name9).toEqual(client9.getName());
            client9.setToken(token9);

            // Test de l'authentification d'un utilisateur avec un token
            res = await request(url).get("/user/whoami").set("x-access-token", client0.getToken());
            expect(res.body.username).toEqual(client0.getName());
        });

        test("User login", async () => {
            // Test du login d'un utilisateur
            const res = await request(url)
                .post("/user/login")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client1.getName(), password: password1 }));
            const tokenTest: string = res.body.token;
            expect((jwt.decode(tokenTest) as { username: string }).username).toEqual(client1.getName());
        });

        test("Username already exists", async () => {
            const res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client1.getName(), password: password1 }))
                .expect(409);
            expect(res.text).toEqual("User already register");
        });

        test("Missing password in user creation", async () => {
            const res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: "thikens" }))
                .expect(400);
            expect(res.text).toEqual("Missing password");
        });

        test("Missing username in user creation", async () => {
            const res = await request(url)
                .post("/user/register")
                .set("content-type", "application/json")
                .send(JSON.stringify({ password: password1 }))
                .expect(400);
            expect(res.text).toEqual("Missing username");
        });

        test("Invalid username", async () => {
            const res = await request(url)
                .post("/user/login")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: "pierre", password: password1 }))
                .expect(500);
            expect(res.text).toEqual("Invalid username or invalid password");
        });

        test("Invalid password", async () => {
            const res = await request(url)
                .post("/user/login")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: client1.getName(), password: "AZERT1234" }))
                .expect(500);
            expect(res.text).toEqual("Invalid username or invalid password");
        });

        test("Missing password in user authentication", async () => {
            const res = await request(url)
                .post("/user/login")
                .set("content-type", "application/json")
                .send(JSON.stringify({ username: "thikens" }))
                .expect(400);
            expect(res.text).toEqual("Missing password");
        });

        test("Missing username in user authentication", async () => {
            const res = await request(url)
                .post("/user/login")
                .set("content-type", "application/json")
                .send(JSON.stringify({ password: password1 }))
                .expect(400);
            expect(res.text).toEqual("Missing username");
        });

        test("Wrong token in authentication", async () => {
            // Échec de l'authentification d'un utilisateur avec un token
            const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB";
            await request(url).get("/user/whoami").set("x-access-token", wrongToken).expect(400);
        });
    });
