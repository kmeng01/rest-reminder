let durationMin = null
let durationSec = null

function getActivation() {
    return new Promise(resolve => {
        chrome.storage.sync.get(['isOn'], function(result) {
            resolve(result.isOn)
        })
    })
}

function getDurationMin() {
    return new Promise(resolve => {
        chrome.storage.sync.get(['durationMin'], function(result) {
            resolve(result.durationMin);
        });
    })
}

async function toggleActivation() {
    var cur = await getActivation()
    if (!cur) {
        startAlarm()
    } else {
        killAlarm()
    }
    chrome.storage.sync.set({isOn: !cur}, function() {})
}

window.onload = async function() {
    var checked = await getActivation()
    durationMin = await getDurationMin()
    durationSec = 60 * durationMin

    if (checked) {
        document.getElementById("onOffToggle").click()
        updateClock()
    }

    document.getElementById("onOffToggle").onclick = () => {
        toggleActivation()
    }
}

function startAlarm() {
    chrome.alarms.create("Rest Timer", {delayInMinutes: durationMin})
    updateClock()
}

function killAlarm() {
    chrome.alarms.clear("Rest Timer")
}

let setTimeDisplay = () => {
    chrome.alarms.get("Rest Timer", (alarm) => {
        if (alarm == undefined) {
            document.getElementById("timeElapsed").innerText = "Time Till Rest: --:--";
            document.getElementById("myBar").style.width = '100%'

            // chrome.storage.sync.set({isOn: false}, function() {})

            // document.getElementById("onOffToggle").onclick = () => {}
            // document.getElementById("onOffToggle").click()
            // document.getElementById("onOffToggle").onclick = () => {
            //     toggleActivation()
            // }

            return;
        }

        const curTime = Date.now()
        const remaining = Math.round((alarm.scheduledTime - curTime) / 1000)

        const rMin = String(Math.floor(remaining / 60)).padStart(2, '0');
        const rSec = String(remaining % 60).padStart(2, '0');

        document.getElementById("timeElapsed").innerText = "Time Till Rest: " + rMin + ':' + rSec;
        document.getElementById("myBar").style.width = String(Math.round(remaining / durationSec * 100)) + '%'
    })
}

async function updateClock() {
    setTimeDisplay()
    
    const checked = await getActivation()
    if (checked) setTimeout(updateClock, 500)
}