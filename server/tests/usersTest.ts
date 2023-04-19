import dotenv from "dotenv";
dotenv.config();

import request from "supertest";

import jwt from "jsonwebtoken";

const { PORT, HOST } = process.env;

const url = `http://${HOST}:${PORT}`;

let token: string;

describe("Test users", () => {
    test("Create user and test whoami", async () => {
        // Test de la création d'un utilisateur
        let res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }));
        token = res.body.token;
        const username: string = (jwt.decode(token) as { username: string }).username;
        expect(username).toEqual("carrereb");

        // Test de l'authentification d'un utilisateur avec un token
        res = await request(url).get("/user/whoami").set("x-access-token", token);
        expect(res.body.username).toEqual(username);
    });

    test("User login", async () => {
        // Test du login d'un utilisateur
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }));
        const tokenTest: string = res.body.token;
        expect((jwt.decode(tokenTest) as { username: string }).username).toEqual("carrereb");
    });

    test("Username already exists", async () => {
        const res = await request(url)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }))
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
            .send(JSON.stringify({ password: "AZERTY1234" }))
            .expect(400);
        expect(res.text).toEqual("Missing username");
    });

    test("Invalid username", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrere", password: "AZERTY1234" }))
            .expect(500);
        expect(res.text).toEqual("Invalid username or invalid password");
    });

    test("Invalid password", async () => {
        const res = await request(url)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERT1234" }))
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
            .send(JSON.stringify({ password: "AZERTY1234" }))
            .expect(400);
        expect(res.text).toEqual("Missing username");
    });

    test("Wrong token in authentication", async () => {
        // Échec de l'authentification d'un utilisateur avec un token
        const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB";
        await request(url).get("/user/whoami").set("x-access-token", wrongToken).expect(400);
    });
});

export { token };
