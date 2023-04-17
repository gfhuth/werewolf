import request from "supertest";
import app from "../server";

import jwt from "jsonwebtoken";

describe("Test users", () => {
    test("Create user", async () => {
        const res = await request(app).post("/user/register").set("content-type", "application/json").send(JSON.stringify({ username: "carrereb", password: "AZERTY1234" }));
        const token: string = (jwt.decode(res.body.token) as { username: string }).username;
        expect(token).toEqual("carrereb");
    });
});
