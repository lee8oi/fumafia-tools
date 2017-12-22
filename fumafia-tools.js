// ==UserScript==
// @name         FuMafia Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tools for making better choices on FuMafia.
// @author       lee8oi@gmail.com
// @match        http://fubar.com/mafia/
// @run-at       document-body
// @updateUrl    https://github.com/lee8oi/fumafia-tools/blob/testing/fumafia-tools.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

var mafia = {
    menu: {},
    marketModule: {},
    page: {},
    territoryTable: {},
    territoryNav: {},
    territoryArray: [],
};

(function() {
    'use strict';

    mafia.menu = document.querySelector("div#mafia_header_listmenu");
    mafia.page = document.querySelector("#pagecontent._mafia_home_page");

    contentObserver();
})();

function contentObserver() {
    var config = { attributes: true, childList: true };
    var callback = function() {
        //console.log(mutationsList);
        var gameSection = mafia.page.querySelector("span.mafia_game_section_hdr");
        if (!gameSection) return;
        var sectionTitle = gameSection.innerHTML;
        switch (sectionTitle) {
            case "Territory &amp; Equipment":
                mafia.marketModule = mafia.page.querySelector("div.mafia_market");
                mafia.territoryNav = mafia.marketModule.querySelector("ul.side_nav li");
                var activeLink = mafia.page.querySelector("a.on").innerHTML.trim();
                console.log(activeLink);
                switch (activeLink) {
                    case "Territory":
                        console.log(activeLink, " Loaded");
                        addCirButton();
                        break;
                    case "Weapons":
                        console.log(activeLink, " Loaded");
                        break;
                }
                break;
            default:
                console.log(sectionTitle);
        }
    };

    var observer = new MutationObserver(callback);
    observer.observe(mafia.page.querySelector("#mafia_content_wrapper"), config);
}

function sortTerritoryArray(arr) {
    arr.sort(function(a,b) {
        //return a[0] - b[0]; //smallest to largest
        return b[0] - a[0]; //largest to smallest
     });
    return arr;
}

function printTerritoryArray(arr) {
    mafia.territoryTable.innerHTML = "";
    for (i = 0; i < arr.length; i++) {
        mafia.territoryTable.appendChild(arr[i][4]);
    }
}

function addCirButton() {
    var link = document.createElement("a");
    link.setAttribute("class", "on");
    link.setAttribute("href","#");
    link.setAttribute("onclick","return false;");
    link.innerHTML = "CIR Sort";
    link.setAttribute("title", "Sort Territories by Cost-Income Rating");
    link.addEventListener("click", processTerritories);
    mafia.territoryNav.appendChild(link);
}

function processTerritories() {
        mafia.territoryTable = mafia.marketModule.getElementsByTagName("table")[2];
        mafia.territoryRows = mafia.territoryTable.getElementsByTagName("tr");
        mafia.territoryArray = [];

        for (i = 0; i < mafia.territoryRows.length; i++) {
            if (i === 0) {
                mafia.territoryArray.push([1000, "", 0, 0, mafia.territoryRows[i]]);
                continue;
            }
            var dataTables = mafia.territoryRows[i].getElementsByTagName("td");
            var costPanel = dataTables[3];
            var territoryName = dataTables[1].querySelector(".mafia_item_hdr").innerHTML;
            var territoryCost = costPanel.getElementsByTagName("b")[0].innerHTML.replace(/[\$\,]/g,"");
            territoryCost = Number(territoryCost);
            var cashValue = costPanel.getElementsByTagName("span")[1].innerHTML.replace(/[\$\,]/g,"");
            cashValue = Number(cashValue);

            valueScore = (cashValue / territoryCost * 1000).toPrecision(3);
            if (valueScore > 1000) {
                valueScore = valueScore / 100;
                valueScore += ".00";
            }
            mafia.territoryArray.push([valueScore, territoryName, territoryCost, cashValue, mafia.territoryRows[i]]);
        }
        printTerritoryArray(sortTerritoryArray(mafia.territoryArray));
}

