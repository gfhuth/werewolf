import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import { login, whoAmI, register, reinitDatabase, debugUser } from "./controllers/userConroller";
import gameRouter from "./routers/game";
import cors from "cors";
import { searchGame } from "./controllers/gameController";

const { PORT, HOST } = process.env;

createSchema();

const app = express();
app.use(
    cors({
        origin: true
    })
);
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.post("/user/login", login);
app.get("/user/whoami", whoAmI);
app.post("/user/register", register);
app.post("/user/reinit", reinitDatabase);
app.get("/user/debug", debugUser);
// END PART TO MOVE

//START move this part in routers/game.ts
app.get("/game/search", searchGame);
// END PART TO MOVE

app.listen(parseInt(PORT), HOST, () => {
    console.log(`The application is listening on port http://${HOST}:${PORT}`);
});
