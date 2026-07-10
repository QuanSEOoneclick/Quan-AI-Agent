#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Crawl Avakids website using Screaming Frog SEO Spider CLI.
This script runs Screaming Frog in headless mode, crawls https://www.avakids.com,
and exports all issues from the 'Issues' tab to the relative directory 'Avakids-references'.
"""

import os
import sys
import shutil
import subprocess

def locate_screaming_frog():
    """
    Locates the Screaming Frog SEO Spider CLI executable on the system.
    Supports Windows, macOS, and Linux, prioritizing standard Windows installation paths.
    """
    # Check if a custom path is specified via environment variable first
    env_path = os.getenv("SCREAMING_FROG_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # Common installation paths on Windows (since the user is on Windows)
    # Also includes standard paths for macOS & Linux for maximum flexibility/portability
    common_paths = [
        r"C:\Program Files\Screaming Frog SEO Spider\ScreamingFrogSEOSpiderCli.exe",
        r"C:\Program Files (x86)\Screaming Frog SEO Spider\ScreamingFrogSEOSpiderCli.exe",
        "/Applications/Screaming Frog SEO Spider.app/Contents/MacOS/ScreamingFrogSEOSpiderLauncher",
        "/usr/bin/screamingfrogseospider"
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
            
    # Try to locate the executable in the system's PATH
    cli_name = "ScreamingFrogSEOSpiderCli.exe" if os.name == 'nt' else "screamingfrogseospider"
    path_in_env = shutil.which(cli_name)
    if path_in_env:
        return path_in_env
        
    return None

def combine_reports(references_dir):
    """
    Combines all CSV files in the 'issues_reports' folder into a single file.
    If 'pandas' and 'openpyxl' are installed, it compiles them into a multi-sheet Excel workbook (.xlsx).
    Otherwise, it falls back to merging them into a single consolidated CSV (.csv) with section headers.
    """
    reports_dir = os.path.join(references_dir, "issues_reports")
    if not os.path.exists(reports_dir):
        print(f"[WARNING] Reports directory not found: {reports_dir}")
        return

    csv_files = [f for f in os.listdir(reports_dir) if f.endswith(".csv")]
    if not csv_files:
        print("[WARNING] No CSV files found to combine.")
        return

    # Filter out any previously combined summary file
    csv_files = [f for f in csv_files if f != "avakids_issues_summary.csv"]

    print(f"Combining {len(csv_files)} report files...")
    
    # Target output paths
    excel_output = os.path.join(references_dir, "avakids_issues_summary.xlsx")
    csv_output = os.path.join(references_dir, "avakids_issues_summary.csv")

    # Try Excel compilation first (requires pandas and openpyxl)
    try:
        import pandas as pd
        # Create Excel writer
        with pd.ExcelWriter(excel_output, engine='openpyxl') as writer:
            for file_name in csv_files:
                file_path = os.path.join(reports_dir, file_name)
                # Sheet name must be <= 31 chars and cannot contain special chars
                sheet_name = os.path.splitext(file_name)[0]
                # Shorten standard Screaming Frog filenames to fit Excel's 31-char limit
                sheet_name = sheet_name.replace("response_codes_", "").replace("internal_server_error_", "5xx_")
                sheet_name = sheet_name[:31]  # Excel sheet limit
                
                try:
                    df = pd.read_csv(file_path)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
                except Exception as e:
                    print(f"  * Failed to add {file_name} to Excel: {e}")
        print(f"[SUCCESS] Combined all reports into a single Excel file: {excel_output}")
        # If we successfully created Excel, clean up old CSV fallback if exists
        if os.path.exists(csv_output):
            os.remove(csv_output)
        return
    except ImportError:
        print("  * 'pandas' or 'openpyxl' not found. Falling back to combined CSV format...")
    
    # Fallback to single combined CSV
    try:
        with open(csv_output, "w", encoding="utf-8-sig") as outfile:
            for file_name in csv_files:
                file_path = os.path.join(reports_dir, file_name)
                section_title = os.path.splitext(file_name)[0].replace("_", " ").upper()
                
                outfile.write(f"\n# ==========================================\n")
                outfile.write(f"# SECTION: {section_title}\n")
                outfile.write(f"# ==========================================\n\n")
                
                with open(file_path, "r", encoding="utf-8-sig") as infile:
                    outfile.write(infile.read())
                    outfile.write("\n")
        print(f"[SUCCESS] Combined all reports into a single CSV file: {csv_output}")
        print("  * TIP: Run 'pip install pandas openpyxl' to export to a multi-sheet Excel file (.xlsx) next time.")
    except Exception as e:
        print(f"[ERROR] Failed to combine into CSV: {e}", file=sys.stderr)

def main():
    print("=" * 60)
    print("Avakids Crawl Script using Screaming Frog SEO Spider")
    print("=" * 60)
    
    # 1. Resolve relative directories dynamically based on the script location
    # Script directory: Project-skills/04_Avakids/Avakids-scripts
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # References directory: Project-skills/04_Avakids/Avakids-references
    references_dir = os.path.abspath(os.path.join(script_dir, "..", "Avakids-references"))
    
    # Create the references directory if it does not exist
    if not os.path.exists(references_dir):
        print(f"Creating output directory: {references_dir}")
        os.makedirs(references_dir, exist_ok=True)
    else:
        print(f"Output directory exists: {references_dir}")
        
    # 2. Locate Screaming Frog CLI
    sf_path = locate_screaming_frog()
    if not sf_path:
        print("[ERROR] Screaming Frog SEO Spider CLI executable not found.", file=sys.stderr)
        print("Please ensure Screaming Frog is installed and licensed.", file=sys.stderr)
        print("You can also set the 'SCREAMING_FROG_PATH' environment variable to its location.", file=sys.stderr)
        sys.exit(1)
        
    print(f"Found Screaming Frog CLI at: {sf_path}")
    
    # 3. Check for custom configuration file in the script directory
    # If the user saved a configuration file here, we will automatically load it.
    config_path = os.path.join(script_dir, "avakids.seospiderconfig")
    use_config = os.path.exists(config_path)
    
    # Define target URL and build command line arguments
    target_url = "https://www.avakids.com"
    
    # Subprocess arguments list (Python handles shell quoting of paths with spaces automatically)
    # We use --export-tabs "Issues" to strictly comply with the user's requirement.
    # Note: If your version of Screaming Frog CLI requires a "Tab:Filter" format (e.g., version 19.8),
    # you can swap this line with the commented-out --bulk-export option below:
    # "--bulk-export", "Issues:All",
    cmd = [
        sf_path,
        "--crawl", target_url,
        "--headless",
        "--export-tabs", "Issues",
        "--output-folder", references_dir
    ]
    
    if use_config:
        cmd.extend(["--config", config_path])
        print(f"Config File: {config_path} (Using custom settings, e.g. User-Agent)")
    else:
        print("Config File: None (Using default Screaming Frog settings)")
        print("  * TIP: If the crawl stops at 1 URL due to a 5xx or 403 error, open Screaming Frog GUI,")
        print("    change the User-Agent to 'Chrome' or 'Googlebot', save the config as 'avakids.seospiderconfig'")
        print("    in the script folder, and run this script again.")
    
    print(f"Target URL:  {target_url}")
    print(f"Export Mode: --export-tabs Issues")
    print(f"Output Path: {references_dir}")
    print("-" * 60)
    print("Starting crawl... This process runs Screaming Frog in headless mode.")
    print("Please wait, this might take several minutes to complete.")
    print("-" * 60)
    
    try:
        # Run subprocess and stream output directly to stdout/stderr in real time
        result = subprocess.run(cmd, check=True)
        
        print("-" * 60)
        print("[SUCCESS] Crawl completed and reports exported successfully.")
        print(f"Files have been saved to: {references_dir}")
        print("=" * 60)
        combine_reports(references_dir)
        
    except subprocess.CalledProcessError as e:
        # Check if the failure was likely due to the --export-tabs "Issues" format requirement
        if "--export-tabs" in cmd:
            print("\n[WARNING] Screaming Frog failed with --export-tabs 'Issues' (unsupported format).")
            print("Retrying automatically using --bulk-export 'Issues:All' to export all issues...")
            print("-" * 60)
            
            # Reconstruct the command using --bulk-export "Issues:All"
            cmd_fallback = []
            for arg in cmd:
                if arg == "--export-tabs":
                    cmd_fallback.append("--bulk-export")
                elif arg == "Issues":
                    cmd_fallback.append("Issues:All")
                else:
                    cmd_fallback.append(arg)
            
            try:
                result = subprocess.run(cmd_fallback, check=True)
                print("-" * 60)
                print("[SUCCESS] Crawl completed and reports exported successfully using fallback.")
                print(f"Files have been saved to: {references_dir}")
                print("=" * 60)
                combine_reports(references_dir)
                return
            except subprocess.CalledProcessError as err:
                print("-" * 60)
                print(f"[ERROR] Screaming Frog CLI failed again with error code: {err.returncode}", file=sys.stderr)
                sys.exit(err.returncode)
                
        print("-" * 60)
        print(f"[ERROR] Screaming Frog CLI exited with error code: {e.returncode}", file=sys.stderr)
        print("Please check your license activation status or Screaming Frog CLI configurations.", file=sys.stderr)
        print("=" * 60)
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        print("\n[WARNING] Crawl execution interrupted by the user.", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
