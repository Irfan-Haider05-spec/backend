import request from "supertest";
import app from "../app";
import { StatusCodes } from "http-status-codes";

describe("GET /health", () => {
  it("should return 200 and healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "Server is healthy");
    expect(res.body).toHaveProperty("uptime");
  });
});
