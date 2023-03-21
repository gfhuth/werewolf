import { Request, Response } from "express";

export async function searchGame(req: Request, res: Response) {
    //Get game list from SQLdatabase;
    // adapt it to json format 
    res.sendStatus(200);
}

export async function searchGameById(req, res) {
    // TODO get list parti
    res.sendStatus(200);
}

export async function searchGameByUsername(req, res) {
    // TODO get list parti
    res.sendStatus(200);
}

export async function newGame(req, res) {
    // TODO get list parti
    res.sendStatus(200);
}
