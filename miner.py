import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import csv
import os
import random
import time
import subprocess
import requests
from datetime import datetime

# ==========================================
# CONFIGURATION
# ==========================================
USERNAME = 'jfensom3'
PASSWORDS = ['Pizza1200', 'Pizza1200!']
BASE_START_ID = 1000 
END_ID = 99999
OUTPUT_FILE = 'master_tt_database.csv'

# 🛑 MASTER NETWORK SWITCH 🛑
# True = Kills script instantly on block (Use for iPhone Hotspot)
# False = Cycles Mac Wi-Fi on block (Use for Home Router / NBN)
IS_ON_MOBILE_HOTSPOT = True 

# Dynamic Scaling Limits
MIN_WORKERS = 4
MAX_WORKERS = 20 # Pushing the limit to 20!
SUCCESS_THRESHOLD_TO_SCALE = 40 

def get_time():
    return datetime.now().strftime('%H:%M:%S')

class PincerMiner:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.processed_count = 0
        self.start_time = time.time()
        self.current_ip = "Unknown"
        self.system_ready = asyncio.Event() 
        
        self.allowed_workers = MIN_WORKERS
        self.consecutive_successes = 0

    def fetch_ip(self):
        try:
            return requests.get("https://api.ipify.org", timeout=5).text
        except:
            return "0.0.0.0"

    def handle_block(self, worker_id, target_id):
        old_ip = self.current_ip
        print(f"\n🧱 [{get_time()}] W{worker_id} hit a firewall on ID: {target_id}.")
        self.system_ready.clear() 
        
        # SCENARIO A: iPhone Hotspot (Explicitly Set by User)
        if IS_ON_MOBILE_HOTSPOT:
            print(f"🚨 [{get_time()}] MOBILE HOTSPOT MODE ACTIVE.")
            print(f"💀 Script cannot physically toggle Airplane Mode. Shutting down safely. Goodnight!")
            os._exit(0)
            
        # SCENARIO B: Home Wi-Fi Network (Explicitly Set by User)
        else:
            print(f"🔄 [{get_time()}] HOME WIFI MODE ACTIVE. Attempting to cycle Wi-Fi...")
            self.allowed_workers = MIN_WORKERS 
            self.consecutive_successes = 0
            
            try:
                subprocess.run(["networksetup", "-setairportpower", "en0", "off"], check=True)
                for i in range(5, 0, -1):
                    print(f"\r🔌 Wi-Fi OFF. Waiting {i}s...   ", end="", flush=True)
                    time.sleep(1)
                    
                subprocess.run(["networksetup", "-setairportpower", "en0", "on"], check=True)
                print(f"\r⚡ [{get_time()}] Wi-Fi ON.                          ")
                
                for i in range(15, 0, -1):
                    print(f"\r⏳ Waiting {i}s for connection...   ", end="", flush=True)
                    time.sleep(1)
                print("\r" + " " * 50 + "\r", end="") 
                
                new_ip = self.fetch_ip()
                if new_ip != "0.0.0.0" and new_ip != old_ip:
                    print(f"✨ [{get_time()}] SUCCESS! ISP gave a new IP: {new_ip}\n")
                    self.current_ip = new_ip
                    self.system_ready.set() 
                else:
                    print(f"⚠️ [{get_time()}] FAILED. Home Router IP didn't change ({new_ip}).")
                    print(f"💀 ISP assigns sticky IPs. Reboot router physically. Shutting down.")
                    os._exit(0)
            except Exception as e:
                print(f"❌ [{get_time()}] Wi-Fi Cycle Error: {e}. Shutting down.")
                os._exit(0)

    def get_resume_point(self):
        found = set()
        if os.path.exists(OUTPUT_FILE):
            try:
                with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader, None)
                    for row in reader:
                        if row and row[0].isdigit():
                            found.add(int(row[0]))
            except Exception:
                pass
        return found

    async def worker(self, worker_id, browser):
        context, page = None, None
        
        async def create_session():
            print(f"🤖 [{get_time()}] W{worker_id}: Booting up and logging in...")
            ctx = await browser.new_context(user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
            await ctx.route("**/*.{png,jpg,jpeg,css,svg}", lambda route: route.abort())
            pg = await ctx.new_page()
            
            try:
                await pg.goto("https://www.tabletennis.org.au/login/", wait_until="domcontentloaded", timeout=15000)
                content = await pg.content()
                
                if "Access Denied" in content or "403" in content:
                    if self.system_ready.is_set():
                        self.handle_block(worker_id, "LOGIN_PAGE")
                    await pg.close(); await ctx.close()
                    return None

                await pg.get_by_placeholder("Your username").fill(USERNAME)
                await pg.get_by_placeholder("Your password").fill(PASSWORDS[1])
                await pg.get_by_role("button", name="LOG IN").click()
                await pg.wait_for_load_state('networkidle', timeout=15000)
                return ctx, pg
            except Exception:
                try: await pg.close(); await ctx.close()
                except: pass
                return None

        if worker_id == 1:
            self.system_ready.set()

        while True:
            if worker_id > self.allowed_workers:
                if page:
                    await page.close()
                    await context.close()
                    context, page = None, None
                await asyncio.sleep(5) 
                continue

            if not self.system_ready.is_set():
                if page:
                    await page.close()
                    await context.close()
                    context, page = None, None
                await self.system_ready.wait()
                continue

            if not page:
                res = await create_session()
                if res is None:
                    await asyncio.sleep(5)
                    continue
                else:
                    context, page = res
                    await asyncio.sleep(worker_id * 1.5) 

            if self.queue.empty(): break
            target_id = await self.queue.get()
            
            # Simple UI string to show which direction we are pulling from
            direction = "⬆️" if target_id < 50000 else "⬇️"
            
            url = f"https://www.tabletennis.org.au/member-finder?parentBodyID={target_id}&firstname=&surname="

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                content = await page.content()

                if "Access Denied" in content or "403" in content:
                    if self.system_ready.is_set():
                        self.handle_block(worker_id, target_id)
                    await self.queue.put(target_id)
                    continue
                
                self.consecutive_successes += 1
                
                if self.consecutive_successes >= SUCCESS_THRESHOLD_TO_SCALE and self.allowed_workers < MAX_WORKERS:
                    self.allowed_workers += 1
                    self.consecutive_successes = 0
                    print(f"📈 [{get_time()}] NETWORK STABLE. Scaling up to {self.allowed_workers} workers!")

                if "No matches" not in content and "Inactive" not in content:
                    soup = BeautifulSoup(content, 'html.parser')
                    tags = soup.find_all(['h3', 'h4', 'strong', 'b'])
                    for tag in tags:
                        text = tag.get_text(strip=True)
                        if "," in text and "Please" not in text:
                            ln, fn = text.split(",")[0].strip(), text.split(",")[1].strip()
                            with open(OUTPUT_FILE, 'a', newline='', encoding='utf-8') as f:
                                csv.writer(f).writerow([target_id, fn, ln])
                            print(f"🎯 [{get_time()}] W{worker_id} {direction} -> {fn} {ln} ({target_id})")
                            break
                
                self.processed_count += 1
                if self.processed_count % 50 == 0:
                    rate = self.processed_count / ((time.time() - self.start_time) / 60)
                    print(f"📊 [{get_time()}] {self.processed_count} checked | {rate:.1f} IDs/min | Active Bots: {self.allowed_workers}")

            except Exception:
                await self.queue.put(target_id)
            
            await asyncio.sleep(random.uniform(1.0, 2.5))
            self.queue.task_done()

        if page: await page.close()
        if context: await context.close()

    async def run(self):
        already_scraped = self.get_resume_point()
        
        # Calculate exactly which IDs we still need
        remaining_ids = [i for i in range(BASE_START_ID, END_ID + 1) if i not in already_scraped]
        remaining_ids.sort()

        # Build the Pincer Movement Queue (1 from bottom, 1 from top)
        left = 0
        right = len(remaining_ids) - 1
        
        while left <= right:
            self.queue.put_nowait(remaining_ids[left])
            if left != right:
                self.queue.put_nowait(remaining_ids[right])
            left += 1
            right -= 1

        self.current_ip = self.fetch_ip()
        print(f"🚀 [{get_time()}] TWO-WAY PINCER RUN")
        print(f"📍 Network Mode: {'MOBILE HOTSPOT (Kill Switch)' if IS_ON_MOBILE_HOTSPOT else 'HOME WIFI (Auto-Cycle)'}")
        print(f"📍 Queue loaded with {len(remaining_ids)} remaining IDs.")
        print(f"⚙️ [{get_time()}] Booting up Headless Chrome engine...")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            print(f"✅ [{get_time()}] Engine ready. Launching Vanguard team...")
            
            workers = [self.worker(i + 1, browser) for i in range(MAX_WORKERS)]
            await asyncio.gather(*workers)
            await browser.close()

if __name__ == "__main__":
    miner = PincerMiner()
    try:
        asyncio.run(miner.run())
    except KeyboardInterrupt:
        print(f"\n👋 [{get_time()}] Manual stop. All data saved.")