import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch ALL rows from a Supabase table by paginating in batches of `batchSize`.
 * Bypasses the server-side row cap (default 1000) completely.
 *
 * Usage:
 *   const rows = await fetchAll<DBRestaurant>("restaurants");
 *   const rows = await fetchAll<DBRestaurant>("restaurants", { select: "city" });
 */
export async function fetchAll<T>(
  table: string,
  options: { select?: string; batchSize?: number } = {}
): Promise<T[]> {
  const { select = "*", batchSize = 1000 } = options;
  const results: T[] = [];
  let from = 0;

  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, to);

    if (error) {
      console.error(`fetchAll error on ${table} [${from}-${to}]:`, error.message);
      break;
    }

    const rows = (data ?? []) as T[];
    results.push(...rows);

    // If we got fewer rows than batchSize, we've reached the end
    if (rows.length < batchSize) break;

    from += batchSize;
  }

  return results;
}
