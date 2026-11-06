# JCUK QR Scanner

Live-camera door check-in for **JCUK (Jordanian Community in the UK)** events.
Volunteers open the page on their phone, enter the door PIN, and point the camera at a member's QR code.

**Scanner link:** https://faisalalamaireh.github.io/JCUK-qr-scanner/

## For volunteers at the door

1. Open the scanner link in **Safari (iPhone)** or **Chrome (Android)**. No Google sign-in is needed.
2. Enter the **door PIN** (ask the membership team) and tap **Start**.
3. Allow the camera when asked, then hold each member's QR code inside the gold square.
   - 🟢 **Welcome / أهلاً وسهلاً**: valid member, now checked in.
   - 🟠 **Already checked in / تم تسجيل الدخول مسبقاً**: this card was already used today (shows the time).
   - 🔴 **Not found / غير مسجل** or **Inactive / عضوية غير فعالة**: don't admit as a member; refer to the membership desk.
4. The screen clears after 2 seconds (or tap it) and is ready for the next person.
5. **No QR code?** Start typing the member number (`20`, `F-20`, `C3`) or their name in the box. Matches appear as you type, and you tap the right person. Spelling doesn't need to be exact: `muhamad`, `kadoumi`, `alutaibi` and `salman mahmoud` all find the right people. A typed number plus **Go** checks in straight away. People already in today show **✓ In at 18:42**.
6. **Who's in?** Tap the gold **Checked in today** button at the top for the list of everyone checked in today, newest first, with times. You can filter it by name or number. Tap ✕ to go back.
7. Tap **Lock / قفل** when you hand the phone to someone else. The PIN is remembered on the phone for 12 hours otherwise.

If the camera doesn't start: check the browser's camera permission for this site, then tap **Start camera** again. You can always type numbers instead.

## For the organiser

- Data lives in the Google Sheet **JCUK Members** (tab `Members`). A check-in writes the time to the **Last Check-in** column; "Checked in today" counts today's times.
- The page talks to the existing **Membership Cards** Apps Script web app (`?api=login|checkin|search|members`). Member QR codes and card links are unchanged. `members` returns name, number, active and today's check-in time only (never emails), refreshed every minute, and powers the instant search and the check-in list.
- The sheet keeps only each member's **latest** check-in, so the list shows today's event; older events are overwritten when the member checks in again.
- **Change the door PIN:** open the Apps Script project → choose `setupDoor` → **Run**. The new PIN appears in the execution log. Phones using the old PIN are sent back to the PIN screen on their next scan.
- The PIN is checked on the server only; it is not stored in this repository.
- `?decoder=jsqr` on the link forces the fallback decoder (for testing).

Built as a single static `index.html` (no build step). QR decoding uses the browser's `BarcodeDetector` where available, otherwise [jsQR 1.4.0](https://github.com/cozmo/jsQR) from jsDelivr.
