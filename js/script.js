// ✅ Spotify Clone - Clean, Optimized, and Well-Commented script.js
console.log("Let's write JavaScript");

// 🔁 Global Variables
let currentSong = new Audio();     // HTML5 audio element
let songs = [];                    // List of songs for the current UI album
let currfolder = "";               // Folder currently displayed in the UI
let currentIndex = 0;              // Index of currently playing song
let isPlaying = false;             // Track if audio is playing
let lockedFolder = "";            // Folder from which the current song is playing

// ⏱ Converts seconds to "mm:ss" format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 📥 Fetch songs from a folder
async function getSongs(folder, updateGlobal = true) {
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    const tempSongs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            tempSongs.push(element.href.split("/").pop());
        }
    }

    // If global update requested, set current folder and song list
    if (updateGlobal) {
        currfolder = folder;
        songs = tempSongs;
    }

    // 🎨 Update the song list in UI if global update
    if (updateGlobal) {
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                </li>`;
        }

        // 🎵 Bind click events to play songs from UI
        Array.from(songUL.getElementsByTagName("li")).forEach((e, i) => {
            e.addEventListener("click", () => {
                currfolder = folder;
                songs = tempSongs;
                currentIndex = i;
                lockedFolder = folder; // lock this album for playback control
                playMusic(songs[i]);
            });
        });
    }

    return tempSongs; // Always return song list
}

// ▶️ Play selected track
function playMusic(track, pause = false) {
    currentIndex = songs.indexOf(track);
    currentSong.src = `./${currfolder}/` + track;
    currentSong.load();

    if (!pause) {
        currentSong.play();
        isPlaying = true;
        play.src = "pause.svg";
    } else {
        isPlaying = false;
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";
}

// 📂 Display all albums in the card UI
async function displayAlbums() {
    let a = await fetch("./Songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let metadata = await fetch(`./Songs/${folder}/info.json`).then(res => res.json());

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141834" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="./Songs/${folder}/cover.jpg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
        }
    }

    // 📦 Clicking an album loads songs but doesn't interrupt current playback
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const albumFolder = `Songs/${card.dataset.folder}`;
            await getSongs(albumFolder, true); // Update UI only
        });
    });
}

// 🚀 Main function to initialize app
async function main() {
    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    await getSongs("Songs/Hindi");
    playMusic(songs[0], true);
    lockedFolder = currfolder;
    await displayAlbums();

    // ▶️ Toggle play/pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
            isPlaying = true;
        } else {
            currentSong.pause();
            play.src = "play.svg";
            isPlaying = false;
        }
    });

    // ⏮ Play previous song in locked album
    previous.addEventListener("click", async () => {
        if (currentIndex > 0) {
            await getSongs(lockedFolder); // Load correct album songs
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    // ⏭ Play next song in locked album
    next.addEventListener("click", async () => {
        if (currentIndex < songs.length - 1) {
            await getSongs(lockedFolder);
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    // ⏱ Update time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // ⏩ Seekbar click to jump in song
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (!isNaN(currentSong.duration)) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width);
            currentSong.currentTime = currentSong.duration * percent;
        }
    });

    // 🔊 Volume control
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // ☰ Show sidebar
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // ❌ Hide sidebar
    const closeButton = document.querySelector(".close img");
    const leftPanel = document.querySelector(".left");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            leftPanel.style.left = "-120%";
        });
    }

    // 🔁 Auto play next song
    currentSong.addEventListener("ended", async () => {
        currentIndex++;
        await getSongs(lockedFolder);
        if (currentIndex >= songs.length) currentIndex = 0;
        playMusic(songs[currentIndex]);
    });

    // Add event listener to mute the tracks
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

// 🟢 Run main
main();