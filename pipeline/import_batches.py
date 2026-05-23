#!/usr/bin/env python3
"""
Import all new_restaurants_batch_*.sql files into Supabase.
Usage:
    export SUPABASE_URL=...
    export SUPABASE_SERVICE_ROLE_KEY=...
    python3 pipeline/import_batches.py
"""
import os, re, sys, time
from supabase import create_client

BATCH_DIR = os.path.expanduser(
    "~/Desktop/Web Application/Sua_Tsui/new_restaurants_all"
)

def parse_sql_values(sql: str) -> list[dict]:
    """Extract rows from INSERT INTO restaurants (...) VALUES (...) SQL."""
    # Get column names
    col_match = re.search(r"INSERT INTO restaurants \(([^)]+)\)", sql)
    if not col_match:
        return []
    cols = [c.strip() for c in col_match.group(1).split(",")]

    # Get all value tuples — handle multi-line
    values_section = sql[sql.index("VALUES") + 6:]
    rows = []
    # Use a simple state machine to split by top-level commas
    depth, buf, in_str, escape = 0, "", False, False
    for ch in values_section:
        if escape:
            buf += ch; escape = False; continue
        if ch == "\\" and in_str:
            buf += ch; escape = True; continue
        if ch == "'" and not in_str:
            in_str = True; buf += ch; continue
        if ch == "'" and in_str:
            in_str = False; buf += ch; continue
        if in_str:
            buf += ch; continue
        if ch == "(":
            depth += 1
            if depth == 1: buf = ""; continue
        if ch == ")":
            depth -= 1
            if depth == 0:
                rows.append(buf.strip())
                buf = ""
            else:
                buf += ch
            continue
        if ch == "," and depth == 0:
            continue
        buf += ch

    result = []
    for row in rows:
        vals = split_csv_values(row)
        if len(vals) != len(cols):
            continue
        record = {}
        for col, val in zip(cols, vals):
            if val.upper() == "NULL":
                record[col] = None
            elif val.startswith("'") and val.endswith("'"):
                record[col] = val[1:-1].replace("''", "'")
            else:
                # numeric
                try:
                    record[col] = float(val) if "." in val else int(val)
                except ValueError:
                    record[col] = val
        result.append(record)
    return result

def split_csv_values(row: str) -> list[str]:
    """Split a CSV row respecting single-quoted strings."""
    vals, buf, in_str = [], "", False
    i = 0
    while i < len(row):
        ch = row[i]
        if ch == "'" and not in_str:
            in_str = True; buf += ch
        elif ch == "'" and in_str:
            # check for escaped ''
            if i + 1 < len(row) and row[i+1] == "'":
                buf += "''"; i += 2; continue
            else:
                in_str = False; buf += ch
        elif ch == "," and not in_str:
            vals.append(buf.strip()); buf = ""
        else:
            buf += ch
        i += 1
    if buf.strip():
        vals.append(buf.strip())
    return vals

def main():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    client = create_client(url, key)

    files = sorted([
        f for f in os.listdir(BATCH_DIR)
        if f.startswith("new_restaurants_batch_") and f.endswith(".sql")
    ])
    print(f"Found {len(files)} batch files")

    total_inserted = 0
    for fname in files:
        path = os.path.join(BATCH_DIR, fname)
        with open(path, encoding="utf-8") as f:
            sql = f.read()
        rows = parse_sql_values(sql)
        if not rows:
            print(f"  {fname}: no rows parsed, skipping")
            continue

        # Upsert in batches of 50
        inserted = 0
        for i in range(0, len(rows), 50):
            batch = rows[i:i+50]
            try:
                res = client.table("restaurants").upsert(
                    batch, on_conflict="gmap_place_id"
                ).execute()
                inserted += len(res.data or [])
            except Exception as e:
                print(f"    ERROR in {fname} batch {i//50}: {e}")
            time.sleep(0.1)

        total_inserted += inserted
        print(f"  {fname}: {len(rows)} parsed → {inserted} upserted")

    print(f"\nDone! Total upserted: {total_inserted}")

if __name__ == "__main__":
    main()
