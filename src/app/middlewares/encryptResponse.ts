import { Request, Response, NextFunction } from "express";
import { encryptData } from "../../utils/encryption";


export const encryptResponse = (req: Request, res: Response, next: NextFunction) => {
  const oldSend = res.send;

  res.send = function (this: Response, body: any) {
    try {
      const encryptedBody = encryptData(body);
      return oldSend.call(this, encryptedBody);
    } catch {

      return oldSend.call(this, body);
    }
  } as any;

  next();
};
