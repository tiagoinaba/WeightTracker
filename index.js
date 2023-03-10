const averagesTable = document.getElementById('averages-table')
const weightTable = document.getElementById('weight-table')
const addBtn = document.getElementById('add-btn')
const weightInput = document.getElementById('weight-input')
const suffixElement = document.getElementById('my-suffix')
const checkbox = document.getElementById('checkbox')
let today = new Date()
let dd = String(today.getDate()).padStart(2, '0')
let mm = String(today.getMonth() + 1).padStart(2, '0')
let yyyy = today.getFullYear()
let weighIns = new Array()
let isKg = checkbox.checked

today = `${dd}/${mm}/${yyyy}`
let todayNumbersOnly = dd + mm + yyyy



function sortLocalStorage(){
    if(localStorage.length > 0){
       var localStorageArray = [];
       for (i=0;i<localStorage.length;i++){
            let tempStr = JSON.parse(localStorage.getItem(localStorage.key(i))).date
            let tempArr = tempStr.split("/")
            tempStr = `${tempArr[2]}/${tempArr[1]}/${tempArr[0]}`
            localStorageArray[i] = {
            localStorageKey: localStorage.key(i),
            createdIn: Date.parse(tempStr),
            data: JSON.parse(localStorage.getItem(localStorage.key(i)))}
       }
    }
    var sortedArray = new Array();
    if(localStorageArray) {
        sortedArray = localStorageArray.sort(function(a, b) {
            return b.createdIn - a.createdIn
        });
          
        return sortedArray;
    } else {
        return [];
    }
    
}
var sortedLocalStorage = sortLocalStorage()

checkbox.addEventListener('change', kgsOrLbs)

function kgsOrLbs() {
    if(checkbox.checked) {
        weightInput.placeholder = 'Input weight in kg'
        suffixElement.innerText = 'kg'
        isKg = true
        renderAverages()
        renderWeighIns()
    } else {
        weightInput.placeholder = 'Input weight in lbs'
        suffixElement.innerText = 'lbs'
        isKg = false
        renderAverages()
        renderWeighIns()
    }
}



function renderWeighIns() {
    let htmlString = ""
    resetWeighInsTable()
    if(isKg) {
        sortedLocalStorage = sortLocalStorage()
        for(let i=0; i < sortedLocalStorage.length; i++) {
            let item = sortedLocalStorage[i]
            htmlString = htmlString + `<tr>
            <td id="${item.localStorageKey}">${item.data.date}</td>
            <td id="${item.localStorageKey}-weight">${item.data.weightInKg}kg</td>
            </tr>`
            weighIns[i] = {
                date: item.data.date,
                weightInKg: item.data.weightInKg,
                weightInLbs: item.data.weightInLbs
            }
        }
    } else {
        sortedLocalStorage = sortLocalStorage()
        for(let i=0; i < sortedLocalStorage.length; i++) {
            let item = sortedLocalStorage[i]
            htmlString = htmlString + `<tr>
            <td id="${item.localStorageKey}">${item.data.date}</td>
            <td id="${item.localStorageKey}-weight">${item.data.weightInLbs}lbs</td>
            </tr>`
            weighIns[i] = {
                date: item.data.date,
                weightInKg: item.data.weightInKg,
                weightInLbs: item.data.weightInLbs
            }
        }
    }
    weightTable.innerHTML += htmlString;
}



weighIns.reverse()

renderWeighIns()
renderAverages()


weightInput.addEventListener('input', function() {
    if(weightInput.value === ''){ 
        addBtn.disabled = true
        suffixElement.classList.add('invisible')
    }
    else {
        addBtn.disabled = false
        suffixElement.classList.remove('invisible')
    }
})

weightInput.addEventListener('input', updateSuffix)

weightInput.onkeydown = function(e) {
    if(!((e.keyCode > 95 && e.keyCode < 106)
    || (e.keyCode > 47 && e.keyCode < 58)
    || e.keyCode == 8 || e.keyCode == 190)) {
        return false;
    }

    if(e.keyCode == 190 && weightInput.value.includes(".")) {
        return false;
    }

}


addBtn.addEventListener('click', function() {

    if (weightInput.value) {
        if(isKg) {
            let data = {
                date: today,
                weightInKg: weightInput.value,
                weightInLbs: (weightInput.value * 2.20462262185).toFixed(2)
            }

            localStorage.setItem(`${todayNumbersOnly}`, JSON.stringify(data))
        
            if(document.getElementById(todayNumbersOnly)) {
                document.getElementById(`${todayNumbersOnly}-weight`).innerText = `${data.weightInKg}kg`
                weighIns.shift()
                weighIns.unshift(data)
            } else {
                let tempTr = document.createElement('tr')
                tempTr.innerHTML += `<td id="${todayNumbersOnly}">${JSON.parse(localStorage.getItem(todayNumbersOnly)).date}</td>
                <td id="${todayNumbersOnly}-weight">${JSON.parse(localStorage.getItem(todayNumbersOnly)).weightInKg}kg</td>`
                weighIns.unshift(data)
                weightTable.children[0].after(tempTr)
                    
            }
        } else {
            let data = {
                date: today,
                weightInKg: (weightInput.value / 2.20462262185).toFixed(2),
                weightInLbs: weightInput.value
            }

            localStorage.setItem(`${todayNumbersOnly}`, JSON.stringify(data))
        
            if(document.getElementById(todayNumbersOnly)) {
                document.getElementById(`${todayNumbersOnly}-weight`).innerText = `${data.weightInLbs}lbs`
                weighIns.shift()
                weighIns.unshift(data)
            } else {
                let tempTr = document.createElement('tr')
                tempTr.innerHTML += `<td id="${todayNumbersOnly}">${JSON.parse(localStorage.getItem(todayNumbersOnly)).date}</td>
                <td id="${todayNumbersOnly}-weight">${JSON.parse(localStorage.getItem(todayNumbersOnly)).weightInLbs}lbs</td>`
                weighIns.unshift(data)
                weightTable.children[0].after(tempTr)
                    
            }
        }
        renderAverages()
    }
    weightInput.value = ''
    suffixElement.classList.add('invisible')
})


function updateSuffix() {
    const width = getTextWidth(weightInput.value, '40px "Montserrat", sans-serif')
    suffixElement.style.left = width + 'px';
}

function calculateAverage(arr) {
    let sum = 0
    if(isKg) {
        for(let i=0; i<arr.length; i++) {
            sum += Number(arr[i].weightInKg)
    
        }
    } else {
        for(let i=0; i<arr.length; i++) {
            sum += Number(arr[i].weightInLbs)
    
        }
    }
    

    return (sum/arr.length).toFixed(2)
}

function renderAverages() {
    let tempHTML = ""
    let tempArr = []
    let averageWeight = 0

    resetAveragesTable()

    if(isKg) {
        if((weighIns.length % 7) === 0) {
        for(let i=0; i < weighIns.length; i += 7) {
            tempArr = weighIns.slice(i, i+7)
            console.log(tempArr)
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[6].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}kg</td>
            </tr>` + tempHTML
        }
        averagesTable.innerHTML += tempHTML

        } else if(weighIns.length > 7) {
            let runTimes = parseInt(weighIns.length / 7)
            let remainder = weighIns.length % 7
            let count = 0
            for(let i=0; i < runTimes; i++) {
                tempArr = weighIns.slice(count, count+7)
                averageWeight = calculateAverage(tempArr)
                timeFrame = tempArr[0].date + " - " + tempArr[6].date
                tempHTML = `<tr>
                <td>${timeFrame}</td>
                <td>${averageWeight}kg</td>
                </tr>` + tempHTML
                count += 7
            }

            tempArr = weighIns.slice((7 * runTimes), ((7 * runTimes) + remainder))
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[remainder - 1].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}kg</td>
            </tr>` + tempHTML

            averagesTable.innerHTML += tempHTML
        } else {
            let runTimes = parseInt(weighIns.length / 7)
            let remainder = weighIns.length % 7
            

            tempArr = (weighIns.slice((7 * runTimes), ((7 * runTimes) + remainder))).reverse()
            console.log(tempArr)
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[remainder - 1].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}kg</td>
            </tr>` + tempHTML

            averagesTable.innerHTML += tempHTML
        }
    } else {
        if((weighIns.length % 7) === 0) {
        for(let i=0; i < weighIns.length; i += 7) {
            tempArr = weighIns.slice(i, i+7)
            console.log(tempArr)
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[6].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}lbs</td>
            </tr>` + tempHTML
        }
        averagesTable.innerHTML += tempHTML

        } else if(weighIns.length > 7) {
            let runTimes = parseInt(weighIns.length / 7)
            let remainder = weighIns.length % 7
            let count = 0
            for(let i=0; i < runTimes; i++) {
                tempArr = weighIns.slice(count, count+7)
                averageWeight = calculateAverage(tempArr)
                timeFrame = tempArr[0].date + " - " + tempArr[6].date
                tempHTML = `<tr>
                <td>${timeFrame}</td>
                <td>${averageWeight}lbs</td>
                </tr>` + tempHTML
                count += 7
            }

            tempArr = weighIns.slice((7 * runTimes), ((7 * runTimes) + remainder))
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[remainder - 1].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}lbs</td>
            </tr>` + tempHTML

            averagesTable.innerHTML += tempHTML
        } else {
            let runTimes = parseInt(weighIns.length / 7)
            let remainder = weighIns.length % 7

            tempArr = (weighIns.slice((7 * runTimes), ((7 * runTimes) + remainder))).reverse()
            averageWeight = calculateAverage(tempArr)
            timeFrame = tempArr[0].date + " - " + tempArr[remainder - 1].date
            tempHTML = `<tr>
            <td>${timeFrame}</td>
            <td>${averageWeight}lbs</td>
            </tr>` + tempHTML

            averagesTable.innerHTML += tempHTML
        }
    }
}

function resetAveragesTable() {
    averagesTable.innerHTML = `<tr>
    <th>Period</th>
    <th>Average</th>
    </tr>` 
}

function resetWeighInsTable() {
    weightTable.innerHTML = `<tr>
    <th>Date</th>
    <th>Weight</th>
    </tr>` 
}


function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}