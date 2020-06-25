// ==UserScript==
// @name         LUMINA Download WebVTT
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.luminaedu.com/course/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...

    const queryTranscriptDownloadButton = () => document.querySelector(".el-icon-download + span > a[href*='/api/v1/module/exportCaption?courseId=']");

    function saveAs(data) {
        let name = data.name.slice(0, -4);
        let vttTitle = `WEBVTT - ${name}`;
        let convertToCueTime = ms => new Date(parseInt(ms)).toJSON().substring(11, 23);
        let cues = data.nls_trans.Sentences.map(l => `${convertToCueTime(l.BeginTime)} --> ${convertToCueTime(l.EndTime)}\n${l.Text}`).join("\n\n");
        let vvt = `${vttTitle}\n\n${cues}`;

        let blob = new Blob([vvt], { type: "text/plain;charset=utf-8" });
        let a = document.createElement('a');
        a.download = `${name}.vvt`;
        a.rel = 'noopener';
        a.href = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4);
        setTimeout(function () { a.click(); }, 0);

    }

    function downloadVvt() {
        let btnSubtitle = queryTranscriptDownloadButton();
        if (btnSubtitle) {
            let subtitleLink = new URL(btnSubtitle.href);
            subtitleLink.pathname = "/api/v1/cloud/getobjectdetail";
            subtitleLink.searchParams.delete("lang");

            fetch(subtitleLink.href)
                .then(response => response.json())
                .then(resp => saveAs(resp.data));
        }
    }

    function createVvtButton() {
        const buttonId = "__USER_SCRIPT_WebVTT_BUTTON";
        if (document.getElementById(buttonId)) return;

        console.log("Checking the [Download WebVTT] button...");

        let btnSubtitle = queryTranscriptDownloadButton();
        if (btnSubtitle) {
            console.log("Creating the [Download WebVTT] button...");
            let c = btnSubtitle.parentElement.parentElement.parentElement;
            let vvtButton = document.createElement("button");
            vvtButton.id = buttonId;
            vvtButton.textContent = "Download WebVTT";
            vvtButton.onclick = downloadVvt;
            c.prepend(vvtButton);
            console.log("Created the [Download WebVTT] button...");
        }
    }

    setInterval(createVvtButton, 1E3);

})();
