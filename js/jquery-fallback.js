"use strict";

// Runs right after the CDN script. If the CDN failed, the local copy of jQuery is loaded instead.
if (!window.jQuery) {
    document.write('<script src="vendor/jquery/jquery-4.0.0.min.js"><\/script>');
}
