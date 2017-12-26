// ==UserScript==
// @name         FuMafia Tools
// @namespace    https://github.com/lee8oi/
// @version      0.3.6
// @description  Tools for making better choices on FuMafia.
// @author       lee8oi@gmail.com
// @match        http://fubar.com/mafia/
// @run-at       document-end
// @updateUrl    https://raw.githubusercontent.com/lee8oi/fumafia-tools/devel/fumafia-tools.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

var mafiaMarket = {};
var mafiaPage = {};
var player = {};

(function() {
    'use strict';
    //playerUpdate();
    contentObserver();
    playerObserver();
    logPlayerData();
})();

function playerUpdate() {
    GM_setValue("player.cash", cashToNumber(document.querySelector("span#mafia_cash").innerHTML));
    GM_setValue("player.flow", cashToNumber(document.querySelector("span#mafia_cash_flow").innerHTML));
    GM_setValue("player.upkeep", cashToNumber(document.querySelector("b#mafia_upkeep").innerHTML));
    GM_setValue("player.health", document.querySelector("span#mafia_health_value").innerHTML);
    GM_setValue("player.healthMax", document.querySelector("span#mafia_max_health_value").innerHTML);
    GM_setValue("player.mobSize", document.querySelector("span#mafia_mob_size").innerHTML);
    GM_setValue("player.rating", document.querySelector("span#mafia_rating").innerHTML);
    logPlayerData();
}

function logPlayerData() {
    player.cash = GM_getValue("player.cash");
    player.flow = GM_getValue("player.flow");
    player.upkeep = GM_getValue("player.upkeep");
    player.health = GM_getValue("player.health");
    player.healthMax = GM_getValue("player.healthMax");
    player.mobSize = GM_getValue("player.mobSize");
    player.rating = GM_getValue("player.rating");
    console.log(player);
}

function playerObserver() {
    var config = { attributes: true, characterData: true, childList: true };
    var callback1 = function() {
        GM_setValue("player.cash", cashToNumber(document.querySelector("span#mafia_cash").innerHTML));
        logPlayerData();
    };
    var observer1 = new MutationObserver(callback1);
    observer1.observe(mafiaPage.querySelector("span#mafia_cash"), config);
    var callback2 = function() {
        GM_setValue("player.flow", cashToNumber(document.querySelector("span#mafia_cash_flow").innerHTML));
    };
    var observer2 = new MutationObserver(callback2);
    observer2.observe(mafiaPage.querySelector("span#mafia_cash_flow"), config);
    var callback3 = function() {
        GM_setValue("player.upkeep", cashToNumber(document.querySelector("b#mafia_upkeep").innerHTML));
    };
    var observer3 = new MutationObserver(callback3);
    observer3.observe(mafiaPage.querySelector("b#mafia_upkeep"), config);
    var callback4 = function() {
        GM_setValue("player.health", document.querySelector("span#mafia_health_value").innerHTML);
    };
    var observer4 = new MutationObserver(callback4);
    observer4.observe(mafiaPage.querySelector("span#mafia_health_value"), config);
    var callback5 = function () {
        GM_setValue("player.healthMax", document.querySelector("span#mafia_max_health_value").innerHTML);
    };
    var observer5 = new MutationObserver(callback5);
    observer5.observe(mafiaPage.querySelector("span#mafia_max_health_value"), config);
    var callback6 = function() {
        GM_setValue("player.mobSize", document.querySelector("span#mafia_mob_size").innerHTML);
    };
    var observer6 = new MutationObserver(callback6);
    observer6.observe(mafiaPage.querySelector("span#mafia_mob_size"), config);
    var callback7 = function() {
        GM_setValue("player.rating", document.querySelector("span#mafia_rating").innerHTML);
    };
    var observer7 = new MutationObserver(callback7);
    observer7.observe(mafiaPage.querySelector("span#mafia_rating"), config);
}

function contentObserver() {
    var config = { attributes: true, childList: true };
    mafiaPage = document.querySelector("#pagecontent._mafia_home_page");
    var callback = function() { //called with mutationList
        var gameSection = mafiaPage.querySelector("span.mafia_game_section_hdr");
        if (!gameSection) return;
        logPlayerData();
        var sectionTitle = gameSection.innerHTML;
        switch (sectionTitle) {
            case "Territory &amp; Equipment":
                mafiaMarket = mafiaPage.querySelector("div.mafia_market");
                var territoryNav = mafiaMarket.querySelector("ul.side_nav li");
                var activeLink = mafiaPage.querySelector("a.on").innerHTML.trim();
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
    cashString = cashString.replace(/[\$\,]/g,"");
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
        if (size === "M") { //What other letters are there? Seriously.
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
        var rowStyle = "";
        for (i = 1; i < territoryRows.length; i++) {
            var dataTables = territoryRows[i].getElementsByTagName("td"),
            costPanel = dataTables[3],
            territoryName = dataTables[1].querySelector(".mafia_item_hdr").innerHTML,
            territoryCost = cashToNumber(costPanel.getElementsByTagName("b")[0].innerHTML),
            cashValue = cashToNumber(costPanel.getElementsByTagName("span")[1].innerHTML),
            valueScore = (cashValue / territoryCost * 1000).toPrecision(3),
            playerCash = GM_getValue("player.cash");
            console.log(territoryName, territoryCost, GM_getValue("player.cash"));
            if (territoryCost < playerCash) {
                if (territoryCost * 10 <= playerCash) {
                    territoryRows[i].style.outline = "medium solid";
                    territoryRows[i].style.outlineColor = "green";
                } else {
                    territoryRows[i].style.outline = "medium solid";
                    territoryRows[i].style.outlineColor = "yellow";
                }
            } else {
                territoryRows[i].style.outline = "medium solid";
                territoryRows[i].style.outlineColor = "red";
            }
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
