let curLoading = {};
let navRootElement = null;
let bodyElement = null;
let fastNav = null;

/* Wrapper around XMLHttpRequest to make it more convenient
 * Calls options.success(response, url), providing the response text and
 *         the canonical URL after redirects.
 * Calls options.error() on error.
 * jQuery's wrapper does not supply XMLHttpRequest.responseURL, making
 * this rewrite necessary. */
function xhrGet(url, options) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            options.success(xhr.responseText, xhr.responseURL);
            options.complete();
        } else {
            options.error();
            options.complete();
        }
    };

    xhr.onerror = function() {
        options.error();
        options.complete();
    };

    xhr.open('GET', url, true);
    try {
        xhr.send();
    } catch (err) {
        options.error();
        options.complete();
    }
}

// Stop loading the currently-in-progress page.
function abortLoading() {
    if (curLoading.timeoutID !== undefined) {
        window.clearTimeout(curLoading.timeoutID);
    }

    if (curLoading.xhr !== undefined) {
        curLoading.xhr.abort();
    }

    curLoading = {};
}

// Load the specified URL.
function loadPage(href, createHistory) {
    if (href === undefined) {
        console.error('Going to undefined path');
    }

    abortLoading();
    bodyElement.classList.add('loading');

    // If something goes wrong while loading, we don't want to leave
    // people without a paddle. If we can't load after a long period of
    // time, bring back the original content.
    curLoading.timeoutID = window.setTimeout(() => {
        bodyElement.classList.remove('loading');
        curLoading.timeoutID = -1;
    }, 10000);

    const startTime = new Date();
    curLoading.xhr = xhrGet(href, {
        'complete': () => {
            abortLoading();
        },
        'error': (error) => {
        // Some browsers consider any file://-type request to be cross-origin.
        // Upon any kind of error, fall back to classic behavior
            console.error(`Failed to load ${href}`);
            window.location = href;
        },
        'success': (pageText, trueUrl) => {
            const enlapsedMs = (new Date()) - startTime;
            bodyElement.classList.remove('loading');

            // Change URL before loading the DOM to properly resolve URLs
            if (createHistory) {
                window.history.pushState({'href': trueUrl}, '', trueUrl);
            }

            const page = document.createElement('html');
            page.innerHTML = pageText;
            const title = page.querySelector('title').textContent;
            const newBody = page.querySelector('.body');
            const newNav = page.querySelector('.sphinxsidebarwrapper');

            // Fade in ONLY if we had enough time to start fading out.
            if (enlapsedMs > (250 / 4)) {
                newBody.classList.add('loading');
            }

            // Replace the DOM elements
            bodyElement.parentElement.replaceChild(newBody, bodyElement);
            bodyElement = newBody;
            navRootElement.parentElement.replaceChild(newNav, navRootElement);
            navRootElement = newNav;
            document.title = title;

            // Update dynamic page features
            fastNav.update();

            if (window.history.onnavigate) {
                window.history.onnavigate();
            }

            // Prime the new DOM so that we can set up our fade-in
            // animation and scroll the new contents to the top.
            window.setTimeout(() => {
                bodyElement.classList.remove('loading');

                // Scroll to the top of the page only if this is a new history entry.
                if (createHistory) {
                    window.scroll(0, 0);
                }
            }, 1);
        }
    });
}

function handlePageClick(ev) {
    // Ignore anything but vanilla click events, so that people can
    // still use special browser behaviors like open in new tab.
    if (!(ev.button !== 0 || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        loadPage(ev.currentTarget.href, true);
    }
}

function handleCompositePageClick(e) {
    // Might be the +/- button, or the actual anchor text.
    const $target = $(e.target);
    // Hacky class check since .hasClass() mysteriously returns false here
    const isToggleButton = $target.filter('span.nested-page-toggle').length > 0;

    if (!isToggleButton) {
        handlePageClick(e);
    }
}

// If the browser is sufficiently modern, make navbar links load only
// content pieces to avoid a full page load.
export function setup(_fastNav) {
    const isStitch = $('body').attr('data-project') === 'stitch';
    if (!isStitch) {
        return false;
    }
    fastNav = _fastNav;
    if (window.history === undefined ||
        document.querySelectorAll === undefined ||
        document.body.classList === undefined ||
        (new XMLHttpRequest()).responseURL === undefined) {
        return false;
    }
    navRootElement = document.querySelector('.sphinxsidebarwrapper');
    bodyElement = document.querySelector('.body');

    // Set up initial state so we can return to our initial landing page.
    window.history.replaceState({'href': window.location.href},
        document.querySelector('title').textContent,
        window.location.href);

    // Set up fastnav links
    const $compositePages = $('li.contains-nested > a');
    const $pages = $('.sphinxsidebarwrapper > ul a.reference.internal').not($compositePages);
    $pages.on('click', handlePageClick);
    $compositePages.on('click', handleCompositePageClick);

    window.onpopstate = function(ev) {
        if (ev.state === null) { return; }
        loadPage(ev.state.href, false);
    };


    return true;
}
