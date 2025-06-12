console.log('Lets write JavaScript');

// Define missing variables
let play = document.getElementById('play');
let next = document.getElementById('next');
let previous = document.getElementById('previous');

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList ul")
    if (!songUL) return songs;
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", "")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        if (play) play.src = "pause.svg"
    }
    let songinfo = document.querySelector(".songinfo");
    if (songinfo) songinfo.innerHTML = decodeURI(track);
    let songtime = document.querySelector(".songtime");
    if (songtime) songtime.innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`./songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    if (!cardContainer) return;
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="./songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])
        })
    })
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/English")
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()

    // Attach an event listener to play, next and previous
    if (play) {
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play()
                play.src = "pause.svg"
            }
            else {
                currentSong.pause()
                play.src = "play.svg"
            }
        })
    }

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        let songtime = document.querySelector(".songtime");
        let circle = document.querySelector(".circle");
        if (songtime) songtime.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        if (circle) circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    let seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            let circle = document.querySelector(".circle");
            if (circle) circle.style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100
        })
    }

    // Add an event listener for hamburger
    let hamburger = document.querySelector(".hamburger");
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            let left = document.querySelector(".left");
            if (left) left.style.left = "0"
        })
    }

    // Add an event listener for close button
    let closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            let left = document.querySelector(".left");
            if (left) left.style.left = "-120%"
        })
    }

    // Add an event listener to previous
    if (previous) {
        previous.addEventListener("click", () => {
            currentSong.pause()
            console.log("Previous clicked")
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }
        })
    }

    // Add an event listener to next
    if (next) {
        next.addEventListener("click", () => {
            currentSong.pause()
            console.log("Next clicked")
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
        })
    }

    // Add an event to volume
    let rangeInput = document.querySelector(".range input[type='range']");
    if (rangeInput) {
        rangeInput.addEventListener("change", (e) => {
            console.log("Setting volume to", e.target.value, "/ 100")
            currentSong.volume = parseInt(e.target.value) / 100
            let volumeImg = document.querySelector(".volume>img");
            if (currentSong.volume > 0 && volumeImg) {
                volumeImg.src = volumeImg.src.replace("mute.svg", "volume.svg")
            }
        })
    }

    // Add event listener to mute the track
    let volumeImg = document.querySelector(".volume>img");
    if (volumeImg) {
        volumeImg.addEventListener("click", e => { 
            if(e.target.src.includes("volume.svg")){
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentSong.volume = 0;
                if (rangeInput) rangeInput.value = 0;
            }
            else{
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentSong.volume = .10;
                if (rangeInput) rangeInput.value = 10;
            }
        })
    }
}

main();
