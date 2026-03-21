// --- Cookie helpers ---
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) + 
        ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// --- Apply saved preference immediately ---
(function() {
    const html = document.documentElement;
    const darkDisabled = getCookie("darkModeDisabled");
    if (darkDisabled === "true") {
        html.classList.add("light");
    } else {
        html.classList.remove("light");
    }
})();

// --- Toggle function ---
function toggleDarkMode() {
    const html = document.documentElement;
    const isLight = html.classList.contains("light");

    if (isLight) {
        html.classList.remove("light");
        setCookie("darkModeDisabled", "false", 30);
    } else {
        html.classList.add("light");
        setCookie("darkModeDisabled", "true", 30);
    }
}

// --- Button event ---
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleDarkMode);
});