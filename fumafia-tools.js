// ==UserScript==
// @name         FuMafia Tools
// @namespace    https://github.com/lee8oi/
// @version      0.3.3
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
    console.log(cashToNumber(document.querySelector("span#mafia_cash").innerHTML));
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
    link.addEventListener("click", territorySort);
    navItem.appendChild(link);
}

function cashToNumber(cashString) {
    cashString = cashString.replace("$","").replace(",","");
    var num = "", numArray = [], size = "";
    if (cashString.indexOf(".") != -1) {
        numArray = cashString.split("");
        for (var i = 0; i < numArray.length; i++) {
            if (isNaN(numArray[i]) && numArray[i] != ".") {
                size += numArray[i];
                numArray.splice(i,1);
            }
        }
        num = Number(numArray.join(""));
        if (size === "M") {
            num = num * 1000000;
        }
        return Number(num);
    }
    return Number(cashString);
}

function territorySort() {
        var territoryTable = mafiaMarket.getElementsByTagName("table")[2],
        territoryRows = territoryTable.getElementsByTagName("tr"),
        territoryArray = [], firstRow = territoryRows[0];
        for (i = 1; i < territoryRows.length; i++) {
            var dataTables = territoryRows[i].getElementsByTagName("td"),
            costPanel = dataTables[3],
            territoryName = dataTables[1].querySelector(".mafia_item_hdr").innerHTML,
            territoryCost = Number(costPanel.getElementsByTagName("b")[0].innerHTML.replace(/[\$\,]/g,"")),
            cashValue = Number(costPanel.getElementsByTagName("span")[1].innerHTML.replace(/[\$\,]/g,"")),
            valueScore = (cashValue / territoryCost * 1000).toPrecision(3);
            territoryArray.push([valueScore, territoryName, territoryCost, cashValue, territoryRows[i]]);
        }
        territoryArray.sort(function(a,b) {
            return b[0] - a[0]; //largest to smallest
        });
        territoryTable.innerHTML = "";
        territoryTable.appendChild(firstRow);
        for (i = 0; i < territoryArray.length; i++) {
            territoryTable.appendChild(territoryArray[i][4]);
        }
}
