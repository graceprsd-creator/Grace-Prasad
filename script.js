
/* ==============================
   MELO - SCRIPT
================================= */

// AUDIO PLAYER
const audio = document.getElementById("audio-player");
const playButton = document.getElementById("play-btn");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.getElementById("volume");

let playlist = [];
let currentTrack = 0;

// NAVIGATION
function showSection(sectionName) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    const selectedSection = document.getElementById(sectionName);

    if (selectedSection) {
        selectedSection.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");

        if (link.dataset.section === sectionName) {
            link.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// SIDEBAR LINKS
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        showSection(this.dataset.section);
    });
});

// SEARCH YOUTUBE
function youtubeSearch() {
    const searchInput = document.getElementById("youtube-search");
    const query = searchInput.value.trim();

    if (!query) {
        alert("Type a song or artist first!");
        return;
    }

    const searchURL =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query + " music");

    window.open(searchURL, "_blank");
}

// DISCOVER SEARCH
function searchMusic() {
    const input = document.getElementById("discover-search");
    const query = input.value.trim();

    if (!query) {
        alert("Enter something to search!");
        return;
    }

    window.open(
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query + " music"),
        "_blank"
    );
}

// SEARCH GENRE
function searchGenre(genre) {
    showSection("discover");

    document.getElementById("discover-search").value = genre;

    window.open(
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(genre + " music"),
        "_blank"
    );
}

// PLAY YOUTUBE VIDEO INSIDE MELO
// Paste a YouTube video link to load the video in the embedded player.
function playYoutubeVideo(url) {
    const videoID = extractYoutubeID(url);

    if (!videoID) {
        alert("Please enter a valid YouTube video link.");
        return;
    }

    document.getElementById("youtube-frame").src =
        "https://www.youtube.com/embed/" + videoID + "?autoplay=1";

    showSection("youtube");
}

// EXTRACT VIDEO ID
function extractYoutubeID(url) {
    try {
        const parsedURL = new URL(url);

        if (parsedURL.hostname.includes("youtu.be")) {
            return parsedURL.pathname.slice(1);
        }

        if (parsedURL.hostname.includes("youtube.com")) {
            if (parsedURL.pathname === "/watch") {
                return parsedURL.searchParams.get("v");
            }

            if (parsedURL.pathname.startsWith("/embed/")) {
                return parsedURL.pathname.split("/")[2];
            }

            if (parsedURL.pathname.startsWith("/shorts/")) {
                return parsedURL.pathname.split("/")[2];
            }
        }
    } catch (error) {
        return null;
    }

    return null;
}

// ADD YOUTUBE LINK INPUT TO PLAYER
const youtubeSection = document.getElementById("youtube");

const videoLinkBox = document.createElement("div");
videoLinkBox.className = "search-box";
videoLinkBox.innerHTML = `
    <span>▶</span>
    <input type="text" id="youtube-link"
    placeholder="Paste a YouTube video link here...">
    <button id="play-youtube-link">Play</button>
`;

youtubeSection.insertBefore(
    videoLinkBox,
    youtubeSection.querySelector(".youtube-container")
);

document.getElementById("play-youtube-link").addEventListener("click", () => {
    const url = document.getElementById("youtube-link").value.trim();
    playYoutubeVideo(url);
});

document.getElementById("youtube-link").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        playYoutubeVideo(event.target.value);
    }
});

// SONGWRITING STUDIO
const lyricsBox = document.getElementById("song-lyrics");
const wordCountDisplay = document.getElementById("word-count");

lyricsBox.addEventListener("input", updateWordCount);

function updateWordCount() {
    const text = lyricsBox.value.trim();

    const words = text === ""
        ? []
        : text.split(/\s+/);

    wordCountDisplay.textContent = words.length + " words";
}

// LOAD SONGS
let savedSongs = JSON.parse(
    localStorage.getItem("melo-songs") || "[]"
);

// SAVE SONG
function saveSong() {
    const title = document.getElementById("song-name").value.trim();
    const mood = document.getElementById("song-mood").value;
    const lyrics = lyricsBox.value.trim();

    if (!title) {
        alert("Give your song a title first!");
        return;
    }

    if (!lyrics) {
        alert("Write some lyrics before saving!");
        return;
    }

    const song = {
        id: Date.now(),
        title: title,
        mood: mood,
        lyrics: lyrics,
        date: new Date().toLocaleDateString()
    };

    savedSongs.unshift(song);

    localStorage.setItem(
        "melo-songs",
        JSON.stringify(savedSongs)
    );

    alert("Your song has been saved ♡");

    document.getElementById("song-name").value = "";
    document.getElementById("song-mood").value = "Uncategorized";
    lyricsBox.value = "";

    updateWordCount();
    displaySongs();
    showSection("library");
}

// DISPLAY SONGS
function displaySongs() {
    const library = document.getElementById("library-list");
    const emptyMessage = document.getElementById("empty-library");
    const songCount = document.getElementById("song-count");

    library.innerHTML = "";

    songCount.textContent = savedSongs.length;

    if (savedSongs.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    savedSongs.forEach(song => {
        const card = document.createElement("div");
        card.className = "saved-song";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = song.title;

        const info = document.createElement("p");
        info.textContent =
            song.mood + " • " + song.date;

        details.appendChild(title);
        details.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "saved-song-actions";

        const viewButton = document.createElement("button");
        viewButton.textContent = "Read lyrics";
        viewButton.addEventListener("click", () => viewSong(song.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-song";
        deleteButton.addEventListener("click", () => deleteSong(song.id));

        actions.appendChild(viewButton);
        actions.appendChild(deleteButton);

        card.appendChild(details);
        card.appendChild(actions);

        library.appendChild(card);
    });
}

// READ SONG
function viewSong(id) {
    const song = savedSongs.find(song => song.id === id);

    if (!song) return;

    alert(
        song.title +
        "\nMood: " + song.mood +
        "\n\n" + song.lyrics
    );
}

// DELETE SONG
function deleteSong(id) {
    const confirmed = confirm("Delete this song from your library?");

    if (!confirmed) return;

    savedSongs = savedSongs.filter(song => song.id !== id);

    localStorage.setItem(
        "melo-songs",
        JSON.stringify(savedSongs)
    );

    displaySongs();
}

// AUDIO PLAYLIST
function loadTrack(index) {
    if (playlist.length === 0) return;

    currentTrack = (index + playlist.length) % playlist.length;

    const track = playlist[currentTrack];

    audio.src = track.file;

    document.getElementById("player-title").textContent = track.title;
    document.getElementById("player-artist").textContent = track.artist;

    audio.load();
}

// PLAY / PAUSE
playButton.addEventListener("click", () => {
    if (!audio.src) {
        alert("Add a music file to your playlist first.");
        return;
    }

    if (audio.paused) {
        audio.play().catch(() => {
            alert("Unable to play this audio file.");
        });
    } else {
        audio.pause();
    }
});

audio.addEventListener("play", () => {
    playButton.textContent = "❚❚";
});

audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
});

// NEXT TRACK
document.getElementById("next-btn").addEventListener("click", () => {
    if (playlist.length === 0) return;

    loadTrack(currentTrack + 1);
    audio.play().catch(() => {});
});

// PREVIOUS TRACK
document.getElementById("prev-btn").addEventListener("click", () => {
    if (playlist.length === 0) return;

    loadTrack(currentTrack - 1);
    audio.play().catch(() => {});
});

// AUTO NEXT
audio.addEventListener("ended", () => {
    if (playlist.length > 1) {
        loadTrack(currentTrack + 1);
        audio.play().catch(() => {});
    }
});

// VOLUME
audio.volume = volumeSlider.value;

volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
});

// PROGRESS
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    progressBar.value =
        (audio.currentTime / audio.duration) * 100;

    document.getElementById("current-time").textContent =
        formatTime(audio.currentTime);

    document.getElementById("duration").textContent =
        formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime =
        (progressBar.value / 100) * audio.duration;
});

// TIME FORMAT
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return minutes + ":" +
        String(remainingSeconds).padStart(2, "0");
}

/* UPLOAD MUSIC TO MELO */

const uploadButton = document.createElement("button");
uploadButton.textContent = "＋";
uploadButton.title = "Upload music";
uploadButton.className = "upload-music-button";

const musicFileInput = document.createElement("input");
musicFileInput.type = "file";
musicFileInput.accept = "audio/*";
musicFileInput.multiple = true;
musicFileInput.hidden = true;

document.querySelector(".player-left").appendChild(uploadButton);
document.body.appendChild(musicFileInput);

uploadButton.addEventListener("click", () => {
    musicFileInput.click();
});

musicFileInput.addEventListener("change", event => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        const fileURL = URL.createObjectURL(file);

        playlist.push({
            file: fileURL,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Your music",
            url: fileURL
        });
    });

    if (playlist.length > 0) {
        loadTrack(0);
        audio.play().catch(() => {});
    }

    musicFileInput.value = "";
});

// INITIALIZE
displaySongs();
updateWordCount();

showSection("home");

console.log("MELO is ready ♫");
