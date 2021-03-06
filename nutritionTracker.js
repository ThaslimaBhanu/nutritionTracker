/**
 * Created by priyanka.t on 06/08/18.
 */

const DAILY_TOTAL_CALORIES_KEY = "dailyTotalCalories";
const FOOD_CONSUMED_KEY = "FOOD_CONSUMED";
const CALORIES_CONSUMED_KEY = "CALORIES_CONSUMED";
const DEFAULT_DAILY_TOTAL_CALORIES = 1700;
let dailyTotalkCals = DEFAULT_DAILY_TOTAL_CALORIES;

let foodItemsInMemoryDB = {//todo: read it from some file/db
    1: ["Plain Roti", 100],
    2: ["Small Pizza", 400],
    3: ["Plate Papdi Chaat", 300],
    4: ["Boiled Egg", 80],
    5: ["Boiled Poached", 80],
    6: ["Egg Fried",110],
    7: ["Egg Omelet",120],
    8: ["Bread slice", 45],
    9: ["Bread slice with butter", 90],
    10: ["Idli ", 100],
    11: ["Dosa Plain", 120],
    12: ["Dosa Masala", 250],
    13: ["Cooked Rice Plain 1 Cup", 120],
    14: ["Cooked Rice Fried 1Cup", 150],
    15: ["Dal 1 Cup", 150],
    16: ["Sambar 1 Cup", 150],
    17: ["Curry", 150],
    18: ["Salad 1 Cup", 100],
    19: ["Tea with milk & sugar 1 Cup", 45],
    20: ["Coffee with milk & sugar 1 Cup", 45],
    21: ["Milk with sugar", 75],
    22: ["Fruit juice concentrated", 120],
    23: ["Ice-cream 1 Cup", 200],
    24: ["Samosa", 100]
};

var tableClass = 'table table-sm table-bordered dark-border food-table';

function isSet(val) {
    switch (typeof val) {
        case "string":
            return val !== undefined && val !== "" && val !== null;
        case "object":
            return val !== null;
        case "number":
        case "boolean":
            return true;
        default:
            return false;
    }
}

function getDate(offset) {
    offset = offset || 0;
    var date = new Date();
    date.setDate(date.getDate() - offset);
    return  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function updateItemsInDropDownFoodMenu() {
    var dropDownMenuElement = document.getElementById("dropdownFoodMenu");
    for (var foodItem in foodItemsInMemoryDB) {
        if (foodItemsInMemoryDB.hasOwnProperty(foodItem)) {
            var op = new Option();
            op.value = foodItem;
            op.text = foodItemsInMemoryDB[foodItem];
            dropDownMenuElement.options.add(op);
        }
    }
}

function getRemainingCaloriesForToday() {
    var dateString = getDate(0);
    var remainingCalories = chrome.storage.sync.get(DAILY_TOTAL_CALORIES_KEY);
    if (!(isSet(remainingCalories) && isSet(remainingCalories[dateString]))) {
        remainingCalories = remainingCalories || {};
        remainingCalories[dateString] = DEFAULT_DAILY_TOTAL_CALORIES;
    }
    return remainingCalories[dateString];
}

function changeDailyTotalCalories(totalCalories) {
    dailyTotalkCals = totalCalories || DEFAULT_DAILY_TOTAL_CALORIES;
}

function updateFoodConsumedTable(dateOffset) {
    dateOffset = dateOffset || 0;
    var dateString = getDate(dateOffset);
    var rows = [];
    rows.push(["Serial Number", "Food Item", "Calories"]);//todo: later add functionality to delete food item

    chrome.storage.sync.get(FOOD_CONSUMED_KEY, function (result) {
        var foodConsumed = result[FOOD_CONSUMED_KEY];
        foodConsumed = foodConsumed || {};

        var foodConsumedOnGivenDate = foodConsumed[dateString];
        foodConsumedOnGivenDate = foodConsumedOnGivenDate || [];
        let serNo = 1;
        for (var ind in foodConsumedOnGivenDate) {
            if (foodConsumedOnGivenDate.hasOwnProperty(ind)) {
                var foodItem = foodConsumedOnGivenDate[ind];
                if (foodItemsInMemoryDB.hasOwnProperty(foodItem)) {
                    rows.push([serNo++, foodItemsInMemoryDB[foodItem][0], foodItemsInMemoryDB[foodItem][1]]);
                }
            }
        }

        var table = document.createElement("table");
        table.setAttribute("class", tableClass);
        var tableBody = document.createElement("tbody");

        var columnCount = rows[0].length;
        for (var i = 0; i < rows.length; i++) {
            if (i === 0) {
                var header = document.createElement("tr");
                for (var j = 0; j < columnCount; j++) {
                    var headerCell = document.createElement("th");
                    var headerCellText = document.createTextNode(rows[i][j]);
                    headerCell.appendChild(headerCellText);
                    header.appendChild(headerCell);
                }
                tableBody.appendChild(header);
            } else {
                var row = document.createElement("tr");
                for (let j = 0; j < columnCount; j++) {
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode(rows[i][j]);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                tableBody.appendChild(row);
            }
        }

        table.appendChild(tableBody);
        var foodTable = document.getElementById("foodConsumedTable");
        if (foodTable.childElementCount > 0) {
            foodTable.removeChild(foodTable.firstElementChild);
        }
        foodTable.appendChild(table);
    });
}

function getSelectedItemId() {
    var dropDownMenuElement = document.getElementById("dropdownFoodMenu");
    return dropDownMenuElement.options[dropDownMenuElement.selectedIndex].value;
}

function updateTotalCaloriesConsumedLabelAndGraph(totalCaloriesForToday) {
    var totalCalLabel = document.getElementById("totalCalConsumedToday");
    totalCalLabel.innerHTML = "Calories consumed today:" + totalCaloriesForToday;
}

function updateTotalCaloriesConsumed(dateOffset) {
    dateOffset = dateOffset || 0;
    chrome.storage.sync.get(FOOD_CONSUMED_KEY, function (result) {
        var foodConsumed = result[FOOD_CONSUMED_KEY];
        foodConsumed = foodConsumed || {};

        var dateString = getDate(dateOffset);
        var foodConsumedForADay = foodConsumed[dateString];
        let totalCal = 0;
        for (let i in foodConsumedForADay) {//foodConsumedForADay is array
            if (foodConsumedForADay.hasOwnProperty(i)) {
                let itemId = foodConsumedForADay[i];
                totalCal += foodItemsInMemoryDB[itemId][1];
            }
        }
        chrome.storage.sync.get(CALORIES_CONSUMED_KEY, function (result) {
            var caloriesConsumed = result[CALORIES_CONSUMED_KEY];
            caloriesConsumed = caloriesConsumed || {};

            var dateString = getDate(dateOffset);
            caloriesConsumed[dateString] = totalCal;

            chrome.storage.sync.set({CALORIES_CONSUMED: caloriesConsumed}, function () {
                if (dateOffset === 0) {
                    updateTotalCaloriesConsumedLabelAndGraph(totalCal);//todo: updateCaloriesConsumed graph and/or number displayed
                }
            });
        });
    });
}

function addFoodItem(dateOffset, itemId) {
    dateOffset = 0;//todo:
    itemId = itemId || getSelectedItemId();
    chrome.storage.sync.get(FOOD_CONSUMED_KEY, function (result) {
        var foodConsumed = result[FOOD_CONSUMED_KEY];
        foodConsumed = foodConsumed || {};

        var dateString = getDate(dateOffset);
        foodConsumed[dateString] = foodConsumed[dateString] || [];
        foodConsumed[dateString].push(itemId);
        chrome.storage.sync.set({FOOD_CONSUMED: foodConsumed}, function () {
            updateFoodConsumedTable(dateOffset);
            updateTotalCaloriesConsumed(dateOffset);
            //todo: update graphs for today
        });
    });
}

function getAllChromeStorageKeys() {
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        console.log(allKeys);
    });
}

function resetTrackingForDay() {
    var dateOffset = 0;
    chrome.storage.sync.get(FOOD_CONSUMED_KEY, function (result) {
        var foodConsumed = result[FOOD_CONSUMED_KEY];
        foodConsumed = foodConsumed || {};

        var dateString = getDate(dateOffset);
        delete foodConsumed[dateString];
        chrome.storage.sync.set({FOOD_CONSUMED: foodConsumed}, function () {
            updateFoodConsumedTable(dateOffset);
            updateTotalCaloriesConsumed(dateOffset);
        });
    });
}

function deleteFoodItem(dateOffset, itemId) {//todo

}

function drawWeeklyCaloriesChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Calories');

    data.addRows([
        [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9]//todo: extract this data from chrome storage
    ]);

    var options = {
        "hAxis": {
            "title": "Date"
        },
        "vAxis": {
            "title": "Calories"
        },
        "backgroundColor": "#f1f8e9"
    };

    var chart = new google.visualization.LineChart(document.getElementById('calories-consumed-chart-div'));
    chart.draw(data, options);
}

function addHandlers() {
    updateItemsInDropDownFoodMenu();
    document.getElementById("addFoodButton").addEventListener("click", addFoodItem);
    updateFoodConsumedTable();
    updateTotalCaloriesConsumed();
    document.getElementById("resetFoodForToday").addEventListener("click", resetTrackingForDay);
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawWeeklyCaloriesChart);
    //todo: draw separate nutrition charts for protein, carb, etc for today
}

window.addEventListener("load", addHandlers, false);

