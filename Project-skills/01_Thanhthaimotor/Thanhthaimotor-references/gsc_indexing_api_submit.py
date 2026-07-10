import os
import sys
import csv
import json
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Set stdout encoding to UTF-8 for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Configurations
KEY_PATH = r"c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\01_Thanhthaimotor\Thanhthaimotor-references\bigquery_key.json"
CSV_PATH = r"c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\01_Thanhthaimotor\Thanhthaimotor-references\Thanhthaimotor_checkindex.csv"
CACHE_PATH = r"c:\Users\Quan Tran\Documents\GitHub\Quan-AI-Agent\Project-skills\01_Thanhthaimotor\Thanhthaimotor-references\inspect_cache.json"

def load_inspect_cache():
    """Load caching of inspected URLs to restore original crawl times."""
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Warning: Failed to load cache file: {e}")
    return {}

def get_indexing_service():
    """Initialize Google Indexing API service."""
    scopes = ['https://www.googleapis.com/auth/indexing']
    if not os.path.exists(KEY_PATH):
        raise FileNotFoundError(f"Key JSON not found at: {KEY_PATH}")
    
    credentials = service_account.Credentials.from_service_account_file(
        KEY_PATH, scopes=scopes
    )
    return build('indexing', 'v3', credentials=credentials)

def save_csv(header, rows):
    """Write back the status to the CSV file safely."""
    try:
        with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(rows)
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")

def main():
    print("🚀 Google Indexing API Bulk Submitter Started")
    
    # 1. Read CSV File
    if not os.path.exists(CSV_PATH):
        print(f"❌ CSV File not found at: {CSV_PATH}")
        return
        
    header = ["URLs check", "trạng thái", "Tên Property", "Thời gian cào", "Google Indexing"]
    rows = []
    cache = load_inspect_cache()
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            file_header = next(reader, None)
            for r in reader:
                if r:
                    # Pad to 5 columns
                    while len(r) < 5:
                        r.append('')
                    
                    url = r[0].strip()
                    
                    # Migration from old 4-column format to new 5-column format:
                    # If column D (index 3) is 'Đã chạy Google Indexing API', migrate it to column E (index 4)
                    if r[3].strip() == 'Đã chạy Google Indexing API':
                        r[4] = 'Đã chạy Google Indexing API'
                    
                    # Restore original last_crawl_time into column D from inspect_cache.json
                    if r[3].strip() in ('Đã chạy Google Indexing API', 'Chưa chạy Google Indexing API', ''):
                        last_crawl = cache.get(url, {}).get('last_crawl_time', '')
                        if last_crawl:
                            r[3] = last_crawl.replace('T', ' ').replace('Z', '')
                        else:
                            r[3] = ''
                            
                    # Standardize column E ("Google Indexing" status)
                    if r[4].strip() != 'Đã chạy Google Indexing API':
                        r[4] = 'Chưa chạy Google Indexing API'
                        
                    # Standardize column B if it has the deprecated "API Index Requested"
                    if r[1].strip() == 'API Index Requested':
                        r[1] = 'Noindex'
                        
                    rows.append(r)
        # Save standard formatting back to the CSV file immediately
        save_csv(header, rows)
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        return
        
    print(f"📋 Loaded {len(rows)} URLs from CSV.")
    
    # Identify the indexes of the columns
    url_idx = 0
    status_idx = 1
    
    # 2. Filter Noindex URLs that have not been run on the Google Indexing API yet (checks column E / index 4)
    noindex_rows = []
    for r in rows:
        if len(r) > 4 and r[status_idx].strip().lower() == 'noindex' and r[4].strip() != 'Đã chạy Google Indexing API':
            noindex_rows.append(r)
            
    total_noindex = len(noindex_rows)
    print(f"🔍 Found {total_noindex} URLs with status 'Noindex'.")
    
    if total_noindex == 0:
        print("🎉 No URLs to index! All pages are already indexed or checked.")
        return
        
    # 3. Prompt user for submission limit
    try:
        limit_input = input("Enter max number of URLs to submit in this run (default 200, max 200 for daily quota limit): ").strip()
        limit = int(limit_input) if limit_input else 200
    except ValueError:
        limit = 200
        
    print(f"⏳ Preparing to submit up to {limit} URLs to Google Indexing API...")
    
    # 4. Initialize Indexing API Service
    try:
        service = get_indexing_service()
    except Exception as e:
        print(f"❌ Failed to initialize Google Indexing API: {e}")
        return
        
    # 5. Process submissions
    submitted_count = 0
    success_count = 0
    
    for r in noindex_rows:
        if submitted_count >= limit:
            print(f"\n✋ Reached the maximum limit of {limit} URLs for this run.")
            break
            
        url = r[url_idx].strip()
        print(f"\n[{submitted_count + 1}/{limit}] Submitting URL: {url}")
        
        try:
            body = {
                'url': url,
                'type': 'URL_UPDATED'
            }
            # Execute publication request
            response = service.urlNotifications().publish(body=body).execute()
            
            # Print response info
            meta = response.get('urlNotificationMetadata', {})
            update_info = meta.get('latestUpdate', {})
            notify_time = update_info.get('notifyTime', 'N/A')
            
            print(f"✅ Success! GSC notified at: {notify_time}")
            
            # Update CSV column E only (do not touch status or crawl time)
            r[4] = 'Đã chạy Google Indexing API'
            success_count += 1
            
        except HttpError as e:
            content = e.content.decode('utf-8') if e.content else str(e)
            try:
                err_data = json.loads(content)
                err_message = err_data.get('error', {}).get('message', content)
            except Exception:
                err_message = content
                
            print(f"❌ API Error: {err_message}")
            
            # Handle specific error codes/reasons
            if e.resp.status == 403:
                print("💡 Tip: Please ensure that:")
                print("  1. The Web Search Indexing API is enabled in your Google Cloud Project console.")
                print("  2. The Service Account email (quantran24211@...) is added as an 'Owner' (or Delegated Owner) of the GSC property.")
                # We stop the script on 403 to prevent spamming failed requests
                print("\n🛑 Stopping execution due to permission error (403).")
                break
            elif e.resp.status == 429:
                print("\n🛑 Quota Limit Reached! Google Indexing API daily quota has been exceeded.")
                break
                
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            
        submitted_count += 1
        # Save CSV incrementally every URL to prevent loss of progress
        save_csv(header, rows)
        
        # Add a tiny delay (0.5s) to avoid rate limits
        time.sleep(0.5)
        
    print(f"\n==================================================")
    print(f"🎉 Job Finished!")
    print(f"   - Processed: {submitted_count} URLs")
    print(f"   - Submitted successfully: {success_count} URLs")
    print(f"   - CSV updated at: {CSV_PATH}")
    print(f"==================================================")

if __name__ == "__main__":
    main()
