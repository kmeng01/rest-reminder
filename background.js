function getActivation() {
    return new Promise(resolve => {
        chrome.storage.sync.get(['isOn'], function(result) {
            resolve(result.isOn);
        });
    })
}

function getDurationMin() {
    return new Promise(resolve => {
        chrome.storage.sync.get(['durationMin'], function(result) {
            resolve(result.durationMin);
        });
    })
}

async function init() {
    var cur = await getActivation();
    var durationMin = await getDurationMin();
    if (cur == undefined) chrome.storage.sync.set({isOn: true}, function() {});
    chrome.storage.sync.set({durationMin: 20}, function() {});

    chrome.alarms.onAlarm.addListener((alarm) => {
        audio.currentTime = 0
        const playPromise = audio.play()

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                const response = confirm('It\'s time to rest your eyes!')
                audio.pause()
            })
            .catch(error => {
                alert('Uh oh, audio error! Contact Kevin.')
            });
        } else {
            alert('Play promise failed')
        }

        chrome.alarms.create("Rest Timer", {delayInMinutes: durationMin})
    })
}

init();

const audio = new Audio('ring.mp3')
audio.loop = true