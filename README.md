# GYMZONE - Assignment 6

Static fitness website for SE-2508: Umirgaliyev Yernar and Kazybek Karabala.

Live site: https://ernarit12.github.io/WebProjectAssignment-5/

Open index.html in a modern browser or serve this folder with a local static server.
No installation or build is required. Bootstrap, fonts, images and the sound are local.
jQuery 4.0.0 loads from the CDN, with a local copy in vendor/jquery if the CDN is unreachable.

## Assignment 6 demonstration

1. Home / Exercise Explorer: type in the search box to filter the cards as you type (Task 1).
2. Same box: choose a suggestion with the mouse, or with the arrows and Enter (Task 2).
3. Home / Training Questions: search the answers to highlight every match (Task 3).
4. Any page: scroll to fill the gradient progress bar at the top (Task 4).
5. Home / GYMZONE in Numbers: the stats count up when the section appears (Task 5).
6. Contact: submit a valid form to see the spinner and "Please wait..." (Task 6).
7. Contact, Copy buttons and Join GYMZONE: a toast confirms the action and fades out (Task 7).
8. Any exercise page or footer: Copy changes to a checkmark with a tooltip (Task 8).
9. Any page: images get their real src only when they come near the viewport (Task 9).

The features from earlier assignments remain: CSS cards, Bootstrap layout, carousel, FAQ,
exercise filters, movement gallery, keyboard navigation, multi-step form, sound and themes.

## File responsibilities

- js/script.js: all jQuery features for Assignment 6.
- css/jquery-features.css: styles for those features.
- js/jquery-fallback.js: loads vendor/jquery/jquery-4.0.0.min.js if the jQuery CDN fails.
- js/main.js: existing behavior, shared validation helpers and popup opening/closing.
- js/exercises.js: exercise objects and methods using switch, find and filter.
- js/advanced.js: keyboard events, dynamic cards, gallery, callback form and sound.
- css/advanced.css: layouts, selected states and event-triggered animations.
- audio/success.wav: original short success sound generated locally.

## Form and audio behavior

The profile is a frontend demonstration. It creates no account, sends no signup data,
and stores no password. Passwords are cleared after success, reset or closing the popup.
The Contact form validates inputs, shows the spinner, then opens a configured email application.
Sound starts muted. One audio element prevents overlap; playback requires user interaction.
Animations respect reduced-motion preferences. Exercise images need JavaScript to load.

## Verification

Chromium through Playwright: all eleven pages at 320, 390, 768 and 1440 pixels (44 checks) for
console errors, horizontal overflow, broken images, lazy loading and the progress bar.
Tests also cover filter and category combinations, keyboard autocomplete, special characters in
both search boxes, clipboard contents, the spinner, toasts inside the popup and the CDN fallback.
Opening the real email application has to be checked by hand.

## Publication

The owner handles commit and push. The existing GitHub Pages workflow deploys every push to main.
Submit the verified URL, Assignment 6 PDF report and project ZIP through LMS.
Every member submits and attends the defense.
