import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import { login, whoAmI, register } from "./controllers/user";
import gameRouter from "./routers/game";

const { PORT, HOST } = process.env;

createSchema();

const app = express();
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.post("/user/login", login);
app.get("/user/whoami", whoAmI);
app.post("/user/register", register);
// END PART TO MOVE

app.listen(parseInt(PORT), HOST, () => {
    console.log(`The application is listening on port https://${HOST}:${PORT}`);
});
