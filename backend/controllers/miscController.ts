import { Request, Response } from "express";

export const ping = (req: Request, res: Response): void => {
  res.send("pong " + new Date().toISOString())
}
