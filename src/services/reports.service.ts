import { supabase } from "../config/supabase-client.js";
import { Tables, TablesInsert } from "../types/database.types.js";

// Type definitions for reports
export type Report = Tables<"reports">;
export type ReportInsert = TablesInsert<"reports">;

// Report result type for getReportsByDeal response
export type ReportResult = {
  reports: Report[];
  totalCount: number;
};

// Add a new report for a deal
export async function addReport(
  userId: string,
  dealId: string,
  reason: string,
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .insert([{ reporter_id: userId, deal_id: dealId, reason }])
    .select()
    .single();

  if (error) throw new Error(`Failed to add report: ${error.message}`);
  return data;
}

// Get all reports for a specific deal
export async function getReportsByDeal(dealId: string): Promise<ReportResult> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get reports: ${error.message}`);

  const reports = data || [];

  return {
    reports,
    totalCount: reports.length,
  };
}

// Delete a report by ID (only by the user who created it)
export async function deleteReport(
  reportId: string,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("reporter_id", userId)
    .select();

  if (error) throw new Error(`Failed to delete report: ${error.message}`);
  
  // Check if any rows were deleted
  if (!data || data.length === 0) {
    throw new Error("Report not found or unauthorized");
  }
}