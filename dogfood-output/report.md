# Dogfood QA Report

**Target:** https://yaver-fx.vercel.app
**Date:** 2026-04-19
**Scope:** YaverFX production app exploratory QA — home/timer, task board, theme screen, sounds screen, sidebar navigation/settings
**Tester:** Hermes Agent (automated exploratory QA)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 2 |
| 🟡 Medium | 1 |
| 🔵 Low | 0 |
| **Total** | **3** |

**Overall Assessment:** Core UI is reachable and some features work, but key navigation and the main timer start action are unreliable enough to block confidence in the production experience.

---

## Issues

### Issue #1: BAŞLAT button does not start the timer and instead changes menu state unexpectedly

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Functional |
| **URL** | https://yaver-fx.vercel.app/ |

**Description:**
On the home screen, the primary `BAŞLAT` CTA for the focus timer did not start the timer. Instead, the page state changed unexpectedly and the menu/overlay state changed. This breaks the main focus-session workflow, which appears to be the app's primary feature.

**Steps to Reproduce:**
1. Open the app home screen.
2. Confirm the timer is in `25:00 / BAŞLAMAYA HAZIR` state.
3. Click the `BAŞLAT` button.

**Expected Behavior:**
The focus timer should start counting down and the session state should visibly change from ready to running.

**Actual Behavior:**
The timer remained unchanged and the menu state changed unexpectedly instead of starting the session.

**Screenshot:**
MEDIA:/home/enesi/.hermes/cache/screenshots/browser_screenshot_e6cd48378d0842bea15482d4da1574c5.png

**Console Errors** (if applicable):
```text
None observed.
```

---

### Issue #2: Sidebar actions are inconsistent/no-op (e.g. Bildirim ayarları and Analitik do nothing)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Functional |
| **URL** | https://yaver-fx.vercel.app/ (observed from Tasks and other screens) |

**Description:**
Sidebar/control actions are inconsistent. During testing, multiple sidebar controls failed to navigate or reveal UI:
- `Bildirim ayarları` produced no visible settings panel or route change.
- `Analitik` remained on the current Tasks page with no visible navigation.
This blocks access to non-core areas and makes the app navigation feel broken.

**Steps to Reproduce:**
1. Navigate to the `Görevler` screen.
2. Click `Bildirim ayarları`.
3. Observe that no settings UI appears and the page remains unchanged.
4. Click `Analitik`.
5. Observe that the app remains on the Tasks page.

**Expected Behavior:**
Each sidebar/settings action should either navigate to the relevant module or open a visible panel/modal.

**Actual Behavior:**
The current page remains unchanged and no destination UI is shown.

**Screenshot:**
MEDIA:/home/enesi/.hermes/cache/screenshots/browser_screenshot_1c710340a7064a338adcdcbe1637a5e5.png

**Additional Evidence:**
MEDIA:/home/enesi/.hermes/cache/screenshots/browser_screenshot_85d4f5e5674041c786ba9ef99fe48854.png

**Console Errors** (if applicable):
```text
None observed.
```

---

### Issue #3: Empty task submission has no validation or user feedback

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | UX |
| **URL** | https://yaver-fx.vercel.app/ (Görevler screen) |

**Description:**
Submitting the task form with an empty input produced no inline validation, toast, disabled-state explanation, or other feedback. Users get no clue why nothing happened.

**Steps to Reproduce:**
1. Navigate to `Görevler`.
2. Leave `Yeni ne başarmak istersin?` empty.
3. Click `Görev ekle`.

**Expected Behavior:**
The app should show a validation message such as `Görev adı gerekli`, highlight the field, or disable the submit button until valid input exists.

**Actual Behavior:**
No task is added and no visible feedback is shown.

**Screenshot:**
MEDIA:/home/enesi/.hermes/cache/screenshots/browser_screenshot_73fc5cc566be4794891edf53ca48ba49.png

**Console Errors** (if applicable):
```text
None observed.
```

---

## Issues Summary Table

| # | Title | Severity | Category | URL |
|---|-------|----------|----------|-----|
| 1 | BAŞLAT button does not start the timer and instead changes menu state unexpectedly | High | Functional | / |
| 2 | Sidebar actions are inconsistent/no-op (e.g. Bildirim ayarları and Analitik do nothing) | High | Functional | / |
| 3 | Empty task submission has no validation or user feedback | Medium | UX | / |

## Testing Coverage

### Pages Tested
- Home / Ana Ekran
- Görevler
- Tema
- Sesler

### Features Tested
- Focus timer start/reset entry points
- Sidebar/menu open-close behavior
- Sidebar navigation cards
- Task creation with empty and valid input
- Task complete / undo / delete flow
- Theme switching
- Ambient sound play control

### Not Tested / Out of Scope
- Authentication / user accounts
- Push notification permission flow (target screen was not reachable)
- Rewards screen
- Analytics screen internals
- Any backend-synced persistence across reloads/devices
- Mobile/desktop breakpoint comparison beyond current browser viewport

### Blockers
- Notification settings and analytics routes/UI were not reachable during testing.
- Navigation behavior appears inconsistent depending on current menu state.

---

## Notes

- Throughout testing, **no console errors** were observed. This suggests the biggest issues are silent UI/state-management bugs rather than crashing JS exceptions.
- Theme switching and basic task CRUD actions worked, so the app is partially functional.
- Highest priority fix should be the **BAŞLAT** CTA and the **broken/inconsistent sidebar routing**, because these directly affect discoverability and the primary focus-session flow.
