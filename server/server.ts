import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createSchema } from "./util/database";
import { getToken, whoAmI } from "./controllers/user";
import gameRouter from "./routers/game";

createSchema();

const app = express();
app.use(express.json());
app.use("/game", gameRouter);

//START move this part in routers/user.ts
app.get("/", (req, res) => {
    res.send("This is a test web page!");
});
app.post("/user/login", getToken);
app.get("/user/whoami", whoAmI);
// END PART TO MOVE

app.listen(3000, () => {
    console.log("The application is listening on port https://localhost:3000");
});
