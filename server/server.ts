import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import { login, whoAmI, register } from "./controllers/user";
import gameRouter from "./routers/game";

createSchema();

const app = express();
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.post("/user/login", login);
app.get("/user/whoami", whoAmI);
app.post("/user/register", register);
// END PART TO MOVE

app.listen(3000, () => {
    console.log("The application is listening on port https://localhost:3000");
});
