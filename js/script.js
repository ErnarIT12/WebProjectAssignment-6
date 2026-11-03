"use strict";

const LAZY_PLACEHOLDER =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const LAZY_BUFFER = 200;
const COPY_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path></svg>';
const CHECK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"></path></svg>';
let pendingCopyText = null;

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchPattern(query) {
    // HTML source wraps long lines, so a space in the query must match any whitespace.
    return new RegExp(`(${escapeRegExp(query).replace(/\s+/g, "\\s+")})`, "gi");
}

function buildHighlightedNodes(text, pattern) {
    // split() with a capture group puts every match at an odd index.
    return text.split(pattern).map((part, index) => {
        if (index % 2 === 0) return document.createTextNode(part);
        return $("<mark>", { class: "search-highlight", text: part })[0];
    });
}

// Task 1 and Task 2: live filter and autocomplete for the Exercise Explorer.
function initializeLiveSearch() {
    const $input = $("#exercise-search");
    if (!$input.length) return;
    const $list = $("#exercise-suggestions");
    const $results = $("#exercise-results");
    const $count = $("#exercise-count");
    const $empty = $("#exercise-empty");
    const $filters = $("[data-exercise-filter]");
    let activeIndex = -1;

    function currentCategory() {
        return $filters.filter('[aria-pressed="true"]').attr("data-exercise-filter");
    }

    function applyFilter() {
        const typed = $input.val().trim();
        const query = typed.toLowerCase();
        const label = exerciseLibrary.getCategoryLabel(currentCategory());
        const $cards = $results.find(".catalog-result");
        const $matches = $cards.filter(function () {
            const text = $(this).find(".card-title, .card-text").text();
            return text.toLowerCase().includes(query);
        });

        $cards.not($matches).hide();
        $matches.show();
        $empty.prop("hidden", $matches.length > 0);
        $count.text(
            query
                ? `${$matches.length} of ${$cards.length} exercises match "${typed}" in ${label}.`
                : `${$cards.length} exercises shown: ${label}.`,
        );
        loadVisibleImages();
    }

    function closeSuggestions() {
        activeIndex = -1;
        $list.prop("hidden", true).empty();
        $input.attr("aria-expanded", "false").removeAttr("aria-activedescendant");
    }

    function renderSuggestions() {
        const query = $input.val().trim().toLowerCase();
        closeSuggestions();
        if (!query) return;

        const pattern = buildSearchPattern(query);
        const matches = exerciseLibrary.items.filter((exercise) =>
            `${exercise.name} ${exercise.description}`.toLowerCase().includes(query),
        );
        if (!matches.length) return;

        matches.forEach((exercise, index) => {
            $("<li>", {
                id: `exercise-suggestion-${index}`,
                class: "search-suggestion",
                role: "option",
                "aria-selected": "false",
                "data-exercise-id": exercise.id,
            })
                .append(
                    $("<span>").append(buildHighlightedNodes(exercise.name, pattern)),
                    $("<small>").text(exerciseLibrary.getCategoryLabel(exercise.category)),
                )
                .appendTo($list);
        });
        $list.prop("hidden", false);
        $input.attr("aria-expanded", "true");
    }

    function moveActive(step) {
        const $options = $list.children();
        activeIndex = (activeIndex + step + $options.length) % $options.length;
        $options.removeClass("is-active").attr("aria-selected", "false");
        const $active = $options.eq(activeIndex).addClass("is-active").attr("aria-selected", "true");
        $input.attr("aria-activedescendant", $active.attr("id"));
    }

    function selectSuggestion(id) {
        const exercise = exerciseLibrary.findById(id);
        $input.val(exercise.name);
        closeSuggestions();
        const category = currentCategory();
        if (category !== "all" && category !== exercise.category) {
            $filters.filter('[data-exercise-filter="all"]').trigger("click");
        }
        applyFilter();
    }

    $input.on("input", function () {
        applyFilter();
        renderSuggestions();
    });
    $input.on("keydown", function (event) {
        const isOpen = !$list.prop("hidden");
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
                event.preventDefault();
                if (!isOpen) renderSuggestions();
                if (!$list.prop("hidden")) moveActive(event.key === "ArrowDown" ? 1 : -1);
                break;
            case "Enter":
                if (activeIndex >= 0) {
                    selectSuggestion($list.children().eq(activeIndex).attr("data-exercise-id"));
                } else {
                    closeSuggestions();
                }
                break;
            case "Escape":
                if (isOpen) {
                    event.preventDefault();
                    closeSuggestions();
                }
                break;
        }
    });
    $input.on("blur", closeSuggestions);
    // Keeps focus in the input, so blur does not close the list before the click lands.
    $list.on("mousedown", (event) => event.preventDefault());
    $list.on("click", ".search-suggestion", function () {
        selectSuggestion($(this).attr("data-exercise-id"));
    });
    // Runs after the handler in advanced.js, which has just rebuilt the cards.
    $filters.on("click", applyFilter);
    applyFilter();
}

// Task 3: highlights every match in the FAQ and opens the answers that contain one.
function initializeFaqHighlight() {
    const $input = $("#faq-search");
    if (!$input.length) return;
    const $status = $("#faq-search-status");
    const $items = $(".faq-item");
    const $searchable = $items.find(".faq-question, .faq-answer p");

    function clearHighlights() {
        $searchable.find("mark.search-highlight").contents().unwrap();
        $searchable.each(function () {
            this.normalize();
        });
    }

    function togglePanel($item, open) {
        const $question = $item.find(".faq-question");
        if (($question.attr("aria-expanded") === "true") !== open) $question.trigger("click");
    }

    $input.on("input", function () {
        const query = $input.val().trim();
        clearHighlights();

        if (query) {
            const pattern = buildSearchPattern(query);
            // .contents() returns text nodes, so tags and attributes can never be rewritten.
            $searchable
                .contents()
                .filter(function () {
                    return this.nodeType === Node.TEXT_NODE && this.nodeValue.split(pattern).length > 1;
                })
                .each(function () {
                    $(this).replaceWith(buildHighlightedNodes(this.nodeValue, pattern));
                });
        }

        $items.each(function () {
            const $item = $(this);
            if ($item.find("mark.search-highlight").length) {
                if ($item.find(".faq-question").attr("aria-expanded") === "false") {
                    $item.data("openedBySearch", true);
                    togglePanel($item, true);
                }
            } else if ($item.data("openedBySearch")) {
                $item.removeData("openedBySearch");
                togglePanel($item, false);
            }
        });

        const matchCount = $items.find("mark.search-highlight").length;
        const itemCount = $items.has("mark.search-highlight").length;
        if (!query) $status.text("");
        else if (!matchCount) $status.text(`No matches for "${query}".`);
        else {
            const matchWord = matchCount === 1 ? "match" : "matches";
            const itemWord = itemCount === 1 ? "question" : "questions";
            $status.text(`${matchCount} ${matchWord} in ${itemCount} ${itemWord}.`);
        }
    });
}

// Task 4: gradient progress bar, added here so every page gets it.
function initializeScrollProgress() {
    const $fill = $('<div class="scroll-progress-fill"></div>');
    $('<div class="scroll-progress" aria-hidden="true"></div>').append($fill).prependTo("body");

    function updateProgress() {
        const scrollable = $(document).height() - $(window).height();
        const percent = scrollable > 0 ? ($(window).scrollTop() / scrollable) * 100 : 0;
        $fill.css("width", `${Math.min(percent, 100)}%`);
    }

    $(window).on("scroll resize load", updateProgress);
    updateProgress();
}

// Task 5: counts each number up once, the first time the section is on screen.
function initializeStatCounters() {
    const $section = $("#site-stats");
    if (!$section.length) return;
    const $numbers = $section.find("[data-count-target]").text("0");

    function startWhenVisible() {
        const viewBottom = $(window).scrollTop() + $(window).height();
        if (viewBottom < $section.offset().top + 80) return;
        $(window).off("scroll.stats resize.stats");

        $numbers.each(function () {
            const $number = $(this);
            const target = Number($number.attr("data-count-target"));
            $({ value: 0 }).animate(
                { value: target },
                {
                    duration: 1800,
                    easing: "swing",
                    step(now) {
                        $number.text(Math.round(now));
                    },
                    complete() {
                        $number.text(target);
                    },
                },
            );
        });
    }

    $(window).on("scroll.stats resize.stats", startWhenVisible);
    startWhenVisible();
}

// Task 6: spinner and disabled button, then the contact form continues to the email app.
function initializeSubmitSpinner() {
    const $form = $("#contact-form");
    if (!$form.length) return;

    $form.on("submit", function (event) {
        // main.js runs first and cancels the event when a field is invalid.
        if (event.isDefaultPrevented()) return;
        event.preventDefault();

        const $button = $form.find('[type="submit"]');
        const label = $button.html();
        $button
            .prop("disabled", true)
            .attr("aria-busy", "true")
            .html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Please wait...');

        window.setTimeout(() => {
            $button.prop("disabled", false).removeAttr("aria-busy").html(label);
            showToast("Form checked. Opening your email app.");
            // The native submit() does not fire this handler again.
            this.submit();
        }, 1800);
    });
}

// Task 7: temporary notification. Called from this file and from advanced.js.
function showToast(message, type = "success") {
    // A modal <dialog> sits above the whole page, so the toast must live inside it.
    const $openDialog = $("dialog[open]").last();
    const $host = $openDialog.length ? $openDialog : $("body");
    let $stack = $host.children(".toast-stack");
    if (!$stack.length) {
        $stack = $('<div class="toast-stack" role="status" aria-live="polite"></div>').appendTo($host);
    }

    $("<div>", { class: `site-toast site-toast-${type}` })
        .append($("<span>").html(type === "success" ? CHECK_ICON : "!"), $("<p>").text(message))
        .hide()
        .appendTo($stack)
        .fadeIn(200)
        .delay(2800)
        .fadeOut(500, function () {
            $(this).remove();
        });
}

// Task 8: execCommand fires the "copy" event, and the handler below fills the clipboard.
async function writeToClipboard(text) {
    pendingCopyText = text;
    const copied = document.execCommand("copy");
    pendingCopyText = null;
    if (!copied) await navigator.clipboard.writeText(text);
}

function createCopyButton(text, name) {
    return $("<button>", {
        type: "button",
        class: "copy-button",
        "aria-label": `Copy ${name}`,
        html: `<span class="copy-icon">${COPY_ICON}</span><span>Copy</span><span class="copy-tooltip">Copied to clipboard!</span>`,
    }).data({ copyText: text, copyName: name });
}

function initializeCopyButtons() {
    $(document).on("copy", function (event) {
        if (pendingCopyText === null) return;
        event.originalEvent.clipboardData.setData("text/plain", pendingCopyText);
        event.preventDefault();
    });

    $(".exercise-content").each(function () {
        const $content = $(this);
        const title = $content.find("h3").text().trim();
        const steps = $content
            .find("ul li")
            .map((index, step) => `${index + 1}. ${$(step).text().trim()}`)
            .get();
        const $heading = $content.find("h4").wrap('<div class="copy-row"></div>');
        createCopyButton(`${title}\n${steps.join("\n")}`, `${title} technique`).insertAfter($heading);
    });

    $(".footer-email").each(function () {
        const $email = $(this);
        const $row = $email.wrap('<div class="copy-row copy-row-start mt-3"></div>').removeClass("mt-3");
        createCopyButton($email.text().trim(), "email address").insertAfter($row);
    });

    $(document).on("click", ".copy-button", async function () {
        const $button = $(this);
        const $icon = $button.find(".copy-icon");
        try {
            await writeToClipboard($button.data("copyText"));
        } catch {
            showToast("Copy failed. Please select the text manually.", "error");
            return;
        }

        window.clearTimeout($button.data("resetTimer"));
        $button.addClass("is-copied");
        $icon.html(CHECK_ICON);
        showToast(`${$button.data("copyName")} copied.`);
        $button.data(
            "resetTimer",
            window.setTimeout(() => {
                $button.removeClass("is-copied");
                $icon.html(COPY_ICON);
            }, 2000),
        );
    });
}

// Task 9: an image gets its real src only when it comes close to the viewport.
function loadLazyImage($image) {
    $image
        .removeClass("lazy-image")
        .addClass("lazy-loading")
        .one("load error", () => $image.removeClass("lazy-loading"))
        .attr("src", $image.attr("data-src"));
}

function loadVisibleImages() {
    const viewTop = $(window).scrollTop();
    const viewBottom = viewTop + $(window).height();

    // :visible skips hidden carousel slides, where offset() would report 0.
    $("img.lazy-image:visible").each(function () {
        const $image = $(this);
        const top = $image.offset().top;
        const bottom = top + $image.outerHeight();
        if (bottom >= viewTop - LAZY_BUFFER && top <= viewBottom + LAZY_BUFFER) {
            loadLazyImage($image);
        }
    });
}

function initializeLazyImages() {
    $(window).on("scroll resize load", loadVisibleImages);
    $(".faq-panel").on("transitionend", loadVisibleImages);
    $("#gymCarousel").on("slide.bs.carousel", function (event) {
        loadLazyImage($(event.relatedTarget).find("img.lazy-image"));
    });
    loadVisibleImages();
}

$(document).ready(function () {
    console.log("jQuery is ready!");
    $.fx.off = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    initializeLazyImages();
    initializeLiveSearch();
    initializeFaqHighlight();
    initializeScrollProgress();
    initializeStatCounters();
    initializeSubmitSpinner();
    initializeCopyButtons();
});
