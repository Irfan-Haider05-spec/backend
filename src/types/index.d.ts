import { JwtPayload } from "jsonwebtoken";

declare global {
  var io: SocketIO.Server;
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
