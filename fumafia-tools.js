// ==UserScript==
// @name         FuMafia Tools
// @namespace    https://github.com/lee8oi/
// @version      0.3
// @description  Tools for making better choices on FuMafia.
// @author       lee8oi@gmail.com
// @match        http://fubar.com/mafia/
// @run-at       document-body
// @updateUrl    https://raw.githubusercontent.com/lee8oi/fumafia-tools/devel/fumafia-tools.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

var mafiaMarket = {};

(function() {
    'use strict';
    contentObserver();
})();

function contentObserver() {
    var config = { attributes: true, childList: true };
    mafiaPage = document.querySelector("#pagecontent._mafia_home_page");
    var callback = function() { //called with mutationList
        var gameSection = mafiaPage.querySelector("span.mafia_game_section_hdr");
        if (!gameSection) return;
        var sectionTitle = gameSection.innerHTML;
        switch (sectionTitle) {
            case "Territory &amp; Equipment":
                mafiaMarket = mafiaPage.querySelector("div.mafia_market");
                var territoryNav = mafiaMarket.querySelector("ul.side_nav li");
                var activeLink = mafiaPage.querySelector("a.on").innerHTML.trim();
                console.log(activeLink);
                switch (activeLink) {
                    case "Territory":
                        console.log(activeLink, " Loaded");
//                         var link = document.createElement("a");
//                         link.setAttribute("class", "on");
//                         link.setAttribute("href","#");
//                         link.setAttribute("onclick","return false;");
//                         link.innerHTML = "CIR Sort";
//                         link.setAttribute("title", "Sort Territories by Cost-Income Rating");
//                         link.addEventListener("click", sortTerritories);
//                         territoryNav.appendChild(link);
                        territorySetup(territoryNav);
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
    observer.observe(mafiaPage.querySelector("#mafia_content_wrapper"), config);
}

function territorySetup (navItem) {
    var link = document.createElement("a");
    link.setAttribute("class", "on");
    link.setAttribute("href","#");
    link.setAttribute("onclick","return false;");
    link.innerHTML = "CIR Sort";
    link.setAttribute("title", "Sort Territories by Cost-Income Rating");
    link.addEventListener("click", sortTerritories);
    navItem.appendChild(link);
}

function sortTerritories() {
        var territoryTable = mafiaMarket.getElementsByTagName("table")[2],
        territoryRows = territoryTable.getElementsByTagName("tr"),
        territoryArray = [];
        for (i = 0; i < territoryRows.length; i++) {
            if (i === 0) {
                territoryArray.push([1000, "", 0, 0, territoryRows[i]]);
                continue;
            }
            var dataTables = territoryRows[i].getElementsByTagName("td"),
            costPanel = dataTables[3],
            territoryName = dataTables[1].querySelector(".mafia_item_hdr").innerHTML,
            territoryCost = Number(costPanel.getElementsByTagName("b")[0].innerHTML.replace(/[\$\,]/g,"")),
            cashValue = Number(costPanel.getElementsByTagName("span")[1].innerHTML.replace(/[\$\,]/g,"")),
            valueScore = (cashValue / territoryCost * 1000).toPrecision(3);
            if (valueScore > 1000) {
                valueScore = valueScore / 100;
                valueScore += ".00";
            }
            territoryArray.push([valueScore, territoryName, territoryCost, cashValue, territoryRows[i]]);
        }
        territoryArray.sort(function(a,b) {
            return b[0] - a[0]; //largest to smallest
        });
        territoryTable.innerHTML = "";
        for (i = 0; i < territoryArray.length; i++) {
            territoryTable.appendChild(territoryArray[i][4]);
        }
}
