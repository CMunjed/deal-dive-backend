import request from "supertest";
import app from "../../src/app.js";

describe("Deal Route Tests", () => {
    describe("GET /api/v1/deals", () => {
        it("Get all deals", async () => {
            const res = await request(app).get('/api/v1/deals');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});
