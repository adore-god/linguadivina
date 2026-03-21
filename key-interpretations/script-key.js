
function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// Apply preference immediately (no waiting)
if (getCookie("darkModeDisabled") === "true") {
    document.documentElement.setAttribute("data-theme", "light");
} else {
    document.documentElement.removeAttribute("data-theme");
}




window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-Z5M83Q78Z0');
