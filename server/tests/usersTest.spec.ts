import request from "supertest";
import { app, server } from "../server";

import jwt from "jsonwebtoken";

afterAll(() => {
    server.close();
});

describe("Test users", () => {
    test("Create user and test whoami", async () => {
        // Test de la création d'un utilisateur
        let res = await request(app)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }));
        const token: string = res.body.token;
        const username: string = (jwt.decode(token) as { username: string }).username;
        expect(username).toEqual("carrereb");

        // Test de l'authentification d'un utilisateur avec un token
        res = await request(app).get("/user/whoami").set("x-access-token", token);
        expect(res.body.username).toEqual(username);
    });

    test("User login", async () => {
        // Test du login d'un utilisateur
        const res = await request(app)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }));
        const token: string = res.body.token;
        expect((jwt.decode(token) as { username: string }).username).toEqual("carrereb");
    });

    test("Wrong user creation", async () => {
        // Nom d'utilisateur déjà existant
        let res = await request(app)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }))
            .expect(409);
        expect(res.text).toEqual("User already register");

        // Il manque le mot de passe
        res = await request(app)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }))
            .expect(400);
        expect(res.text).toEqual("Missing password");

        // Il manque le nom d'utilisateur
        res = await request(app)
            .post("/user/register")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: "AZERTY1234" }))
            .expect(400);
        expect(res.text).toEqual("Missing username");
    });

    test("Wrong authentication", async () => {
        // Nom d'utilisateur invalide
        let res = await request(app)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrere", password: "AZERTY1234" }))
            .expect(500);
        expect(res.text).toEqual("Invalid username or invalid password");

        // Mot de passe invalide
        res = await request(app)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "carrereb", password: "AZERT1234" }))
            .expect(500);
        expect(res.text).toEqual("Invalid username or invalid password");

        // Il manque le mot de passe
        res = await request(app)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ username: "thikens" }))
            .expect(400);
        expect(res.text).toEqual("Missing password");

        // Il manque le nom d'utilisateur
        res = await request(app)
            .post("/user/login")
            .set("content-type", "application/json")
            .send(JSON.stringify({ password: "AZERTY1234" }))
            .expect(400);
        expect(res.text).toEqual("Missing username");

        // Échec de l'authentification d'un utilisateur avec un token
        const wrongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnJlcmViIiwiaWF0IjoxNjc5OTkzNTI5fQ.ZqXY29e2mcejz2ycLwEk00xE2dzdMCm0K4A-3uR4LuB";
        res = await request(app).get("/user/whoami").set("x-access-token", wrongToken).expect(400);
    });
});
