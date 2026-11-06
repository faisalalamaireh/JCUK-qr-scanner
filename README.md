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
5. **No QR code?** Type the member number (`20`, `F-20`, `F-000020`) or part of their name in the box, tap **Go**, then tap the right person.
6. Tap **Lock / قفل** when you hand the phone to someone else. The PIN is remembered on the phone for 12 hours otherwise.

If the camera doesn't start: check the browser's camera permission for this site, then tap **Start camera** again. You can always type numbers instead.

## For the organiser

- Data lives in the Google Sheet **JCUK Members** (tab `Members`). A check-in writes the time to the **Last Check-in** column; "Checked in today" counts today's times.
- The page talks to the existing **Membership Cards** Apps Script web app (`?api=login|checkin|search`). Member QR codes and card links are unchanged.
- **Change the door PIN:** open the Apps Script project → choose `setupDoor` → **Run**. The new PIN appears in the execution log. Phones using the old PIN are sent back to the PIN screen on their next scan.
- The PIN is checked on the server only; it is not stored in this repository.
- `?decoder=jsqr` on the link forces the fallback decoder (for testing).

Built as a single static `index.html` (no build step). QR decoding uses the browser's `BarcodeDetector` where available, otherwise [jsQR 1.4.0](https://github.com/cozmo/jsQR) from jsDelivr.
