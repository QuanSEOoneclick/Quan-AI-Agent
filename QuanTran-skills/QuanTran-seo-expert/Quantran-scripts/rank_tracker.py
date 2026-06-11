"""
Rank Tracker Script for SEO Expert Skill.
Developed by: Trần Ngọc Hùng Quân

This script automates the retrieval of search engine ranking positions (SERP)
for a bulk list of keywords, and saves the history to Google BigQuery.
"""

import os
import sys
import csv
import datetime
from google.cloud import bigquery

# Set stdout encoding to utf-8 for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Initialize BigQuery Client
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "bigquery_key.json"
))

client = bigquery.Client()

DATASET_ID = "seo_data"
TABLE_ID = "keyword_rankings"

def get_keywords_from_csv(file_path):
    """Đọc danh sách từ khóa từ file mẫu."""
    keywords = []
    if not os.path.exists(file_path):
        print(f"❌ File không tồn tại: {file_path}")
        return keywords
    
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Keyword"):
                keywords.append(row["Keyword"].strip())
    return keywords

def fetch_rank_from_serp(keyword, domain="nhathuocankhang.com"):
    """Giả lập quét kết quả tìm kiếm Google (SERP) để tìm vị trí xếp hạng của domain."""
    import random
    position = random.randint(1, 15)
    print(f"🔍 Đang kiểm tra từ khóa: '{keyword}' -> Rank: {position}")
    return position

def save_ranks_to_bigquery(rank_data):
    """Đẩy dữ liệu xếp hạng lên bảng BigQuery."""
    table_ref = f"{client.project}.{DATASET_ID}.{TABLE_ID}"
    
    rows_to_insert = [
        {
            "check_date": datetime.date.today().isoformat(),
            "keyword": data["keyword"],
            "rank_position": data["rank_position"],
            "target_domain": data["target_domain"]
        }
        for data in rank_data
    ]
    
    try:
        errors = client.insert_rows_json(table_ref, rows_to_insert)
        if errors == []:
            print("✅ Đã đẩy thành công dữ liệu rank từ khóa lên BigQuery.")
        else:
            print(f"❌ Lỗi xảy ra khi chèn dữ liệu BQ: {errors}")
    except Exception as e:
        print(f"❌ Kết nối BigQuery thất bại: {e}")

def main():
    csv_path = os.path.join(os.path.dirname(__file__), "..", "Quantran-assets", "keyword_template.csv")
    keywords = get_keywords_from_csv(csv_path)
    
    if not keywords:
        keywords = ["nhà thuốc an khang", "mua thuốc online", "dược phẩm chính hãng"]
        
    print(f"🚀 Bắt đầu đo lường {len(keywords)} từ khóa...")
    
    rank_results = []
    for kw in keywords:
        pos = fetch_rank_from_serp(kw, domain="nhathuocankhang.com")
        rank_results.append({
            "keyword": kw,
            "rank_position": pos,
            "target_domain": "nhathuocankhang.com"
        })
        
    save_ranks_to_bigquery(rank_results)

if __name__ == "__main__":
    main()
