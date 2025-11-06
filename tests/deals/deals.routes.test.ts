import request from "supertest";
import app from "../../src/app.js";

describe("Deal Route Tests", () => {
    describe("GET /api/v1/deal/:id", () => {
        /*it("Fetch an existing deal", async () => {
            
        });*/

        it("Fetch a nonexistent deal", async () => {
            const deal_id = "00000000-0000-0000-0000-000000000000";
            const res = await request(app).get(`/api/v1/deals/${deal_id}`);
            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    error: expect.any(String),
                })
            );
        });
    });

    describe("GET /api/v1/deals", () => {
        it("Get all deals", async () => {
            const res = await request(app).get('/api/v1/deals');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

});
