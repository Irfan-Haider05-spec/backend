import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import session from "express-session";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
//  SubscriptionRoutes import 
import handleStripeWebhook from "./helpers/handleStripeWebhook";
import { logger } from "./shared/logger";
import router from "./app/routes";


const app = express();

// ⚡️ Stripe webhook route must be before json parser
app.post(
  '/api/v1/subscription/webhook',
  express.raw({ type: 'application/json' }), // raw body
  handleStripeWebhook
);

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// cookie parser

app.use(cookieParser());

// body parser
app.use(
  cors({
    origin: [
      "http://10.10.26.175:3003",
      "http://10.10.26.175:3004",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://31.97.117.41:3003",
      "http://31.97.117.41:3004",
      "http://172.17.80.1:3000",
      "http://127.0.0.1:3000",      
      "http://localhost:3000",     
      "http://192.168.32.1:3000",   
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.options("*", cors({
  origin: [
      "http://10.10.26.175:3003",
      "http://10.10.26.175:3004",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://31.97.117.41:3003",
      "http://31.97.117.41:3004",
      "http://172.17.80.1:3000",
      "http://127.0.0.1:3000",      
      "http://localhost:3000",     
      "http://192.168.32.1:3000",   
    ],
  credentials: true,
}));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(mongoSanitize());
app.use(xss());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// file retrieve
app.use(express.static("uploads"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  })
);


// 🔹 Worker PID logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP Request", {
      worker: process.pid,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Date.now() - start,
    });
  });

  next();
});

// health check for Docker/Deployments
app.get("/health", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
  });
});

// router
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hey Backend, How can I assist you ");
});

// global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;


