from playwright.sync_api import sync_playwright
import time

# ==========================================
# CONFIGURATION
# ==========================================
USERNAME = 'jfensom3'
PASSWORD = 'Pizza1200!'

def visual_debug_login():
    with sync_playwright() as p:
        # headless=False makes the Chrome window visible on your screen
        # slow_mo=50 slows down the typing slightly so you can watch it happen
        browser = p.chromium.launch(headless=False, slow_mo=50) 
        page = browser.new_page()

        print("🌍 Opening Table Tennis Australia...")
        page.goto("https://www.tabletennis.org.au/login/")

        print("⌨️ Typing credentials...")
        try:
            # We use the exact placeholder text visible on the screen to find the boxes
            page.get_by_placeholder("Your username").fill(USERNAME)
            page.get_by_placeholder("Your password").fill(PASSWORD)
            
            print("🖱️ Clicking Log In...")
            # We explicitly target the button that says "LOG IN"
            page.get_by_role("button", name="LOG IN").click()
            
        except Exception as e:
            print(f"❌ Failed to find the input boxes: {e}")

        print("\n👀 LOOK AT THE CHROME WINDOW!")
        print("Did it log in successfully? Check the screen.")
        print("Script will auto-close the browser in 30 seconds...\n")
        
        # Keeps the browser open for 30 seconds so you can analyze the result
        time.sleep(30) 

        browser.close()

if __name__ == "__main__":
    visual_debug_login()