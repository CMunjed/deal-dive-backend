import { Tables, TablesInsert, TablesUpdate } from "../types/database.types.js";

export type Deal = Tables<"deals">;
export type DealInsert = TablesInsert<"deals">;
export type DealUpdate = TablesUpdate<"deals">;
