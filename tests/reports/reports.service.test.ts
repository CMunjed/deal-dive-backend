import {
  addReport,
  getReportsByDeal,
  deleteReport,
} from "../../src/services/reports.service.js";
import { cleanupDeal, createTestDeal } from "../deals/deals.util.js";
import { cleanupReports } from "./reports.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";
const TEST_USER_ID_2 = "02112c00-ef33-44cb-952f-f2febc5065ea";

describe("Reports Service Tests", () => {
  let testDealId: string;

  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID);
    testDealId = deal.id;
  });

  afterAll(async () => {
    if (testDealId) {
      await cleanupReports(testDealId);
      await cleanupDeal(testDealId);
    }
  });

  afterEach(async () => {
    await cleanupReports(testDealId);
  });

  describe("addReport", () => {
    it("should add a report to a deal", async () => {
      const reason = "Spam";
      const report = await addReport(TEST_USER_ID, testDealId, reason);

      expect(report).toHaveProperty("id");
      expect(report.reporter_id).toBe(TEST_USER_ID);
      expect(report.deal_id).toBe(testDealId);
      expect(report.reason).toBe(reason);
      expect(report).toHaveProperty("created_at");
      expect(report.status).toBe("pending");
    });

    it("should add multiple reports from different users", async () => {
      await addReport(TEST_USER_ID, testDealId, "Spam");
      await addReport(TEST_USER_ID_2, testDealId, "Inappropriate");

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(2);
    });

    it("should allow same user to report multiple times with different reasons", async () => {
      await addReport(TEST_USER_ID, testDealId, "Spam");
      await addReport(TEST_USER_ID, testDealId, "Misleading");

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(2);
      expect(result.reports[0].reporter_id).toBe(TEST_USER_ID);
      expect(result.reports[1].reporter_id).toBe(TEST_USER_ID);
    });

    it("should handle common report reasons", async () => {
      const reasons = [
        "Spam",
        "Inappropriate",
        "Misleading",
        "Expired",
        "Duplicate",
      ];

      for (const reason of reasons) {
        const report = await addReport(TEST_USER_ID, testDealId, reason);
        expect(report.reason).toBe(reason);
      }

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(reasons.length);
    });
  });

  describe("getReportsByDeal", () => {
    it("should return empty result for deal with no reports", async () => {
      const result = await getReportsByDeal(testDealId);

      expect(result.reports).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("should return all reports for a deal", async () => {
      await addReport(TEST_USER_ID, testDealId, "Spam");
      await addReport(TEST_USER_ID_2, testDealId, "Inappropriate");
      await addReport(TEST_USER_ID, testDealId, "Misleading");

      const result = await getReportsByDeal(testDealId);

      expect(result.totalCount).toBe(3);
      expect(result.reports).toHaveLength(3);
    });

    it("should return reports ordered by creation time (oldest first)", async () => {
      const report1 = await addReport(TEST_USER_ID, testDealId, "First");
      await new Promise((resolve) => setTimeout(resolve, 10));
      const report2 = await addReport(TEST_USER_ID, testDealId, "Second");
      await new Promise((resolve) => setTimeout(resolve, 10));
      const report3 = await addReport(TEST_USER_ID, testDealId, "Third");

      const result = await getReportsByDeal(testDealId);

      expect(result.reports[0].id).toBe(report1.id);
      expect(result.reports[1].id).toBe(report2.id);
      expect(result.reports[2].id).toBe(report3.id);
    });

    it("should not return reports from other deals", async () => {
      const otherDeal = await createTestDeal(TEST_USER_ID);
      await addReport(TEST_USER_ID, testDealId, "Report on test deal");
      await addReport(TEST_USER_ID, otherDeal.id, "Report on other deal");

      const result = await getReportsByDeal(testDealId);

      expect(result.totalCount).toBe(1);
      expect(result.reports[0].deal_id).toBe(testDealId);

      // Cleanup
      await cleanupReports(otherDeal.id);
      await cleanupDeal(otherDeal.id);
    });
  });

  describe("deleteReport", () => {
    it("should delete a report by the user who created it", async () => {
      const report = await addReport(TEST_USER_ID, testDealId, "Spam");

      await deleteReport(report.id, TEST_USER_ID);

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(0);
    });

    it("should not delete report if userId doesn't match", async () => {
      const report = await addReport(
        TEST_USER_ID,
        testDealId,
        "User 1's report",
      );

      // Try to delete with different user
      await expect(deleteReport(report.id, TEST_USER_ID_2)).rejects.toThrow();

      // Report should still exist
      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(1);
    });

    it("should only delete the specified report", async () => {
      const report1 = await addReport(TEST_USER_ID, testDealId, "Spam");
      await addReport(TEST_USER_ID, testDealId, "Inappropriate");

      await deleteReport(report1.id, TEST_USER_ID);

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(1);
      expect(result.reports[0].reason).toBe("Inappropriate");
    });

    it("should handle deleting non-existent report gracefully", async () => {
      await expect(
        deleteReport("00000000-0000-0000-0000-000000000000", TEST_USER_ID),
      ).rejects.toThrow();
    });

    it("should allow deletion of multiple reports by same user", async () => {
      const report1 = await addReport(TEST_USER_ID, testDealId, "Spam");
      const report2 = await addReport(TEST_USER_ID, testDealId, "Misleading");

      await deleteReport(report1.id, TEST_USER_ID);
      await deleteReport(report2.id, TEST_USER_ID);

      const result = await getReportsByDeal(testDealId);
      expect(result.totalCount).toBe(0);
    });
  });
});