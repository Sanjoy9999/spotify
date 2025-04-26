console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  try {
    let response = await fetch(`./${folder}/info.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response.json();
    songs = data.songs || [];
    
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
      songUL.innerHTML += `
        <li>
          <img class="invert" width="34" src="images/music.svg" alt="">
          <div class="info">
            <div>${decodeURIComponent(song)}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg" alt="">
          </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info div").innerText);
      });
    });

    return songs;
  } catch (error) {
    console.error("Error loading songs:", error, folder);
    return [];
  }
}

const playMusic = (track, pause = false) => {
  try {
    currentSong.src = `./${currFolder}/${track}`;
    if (!pause) {
      currentSong.play()
        .then(() => {
          play.src = "images/pause.svg";
        })
        .catch(e => {
          console.error("Error playing song:", e);
          alert("Unable to play song. Please check if the file exists.");
        });
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  } catch (error) {
    console.error("Error setting up music:", error);
  }
};

async function displayAlbums() {
  try {
    const folders = ['AChill_songs', 'BRomantic songs', 'CSad songs'];
    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
      try {
        let albumInfo = await fetch(`./${folder}/info.json`);

        if (!albumInfo.ok) continue;

        let albumData = await albumInfo.json();

        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"></path>
              </svg>
            </div>
            <img src="./${folder}/cover.jpeg" alt="${albumData.title}">
            <h2>${albumData.title}</h2>
            <p>${albumData.description}</p>
          </div>`;
      } catch (error) {
        console.error(`Error loading album ${folder}:`, error);
      }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        let folder = item.currentTarget.dataset.folder;
        songs = await getSongs(folder);
        if (songs.length > 0) {
          playMusic(songs[0]);
        }
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

async function main() {
  try {
    let defaultFolder = "AChill_songs";
    await getSongs(defaultFolder);
    if (songs && songs.length > 0) {
      playMusic(songs[0], true);
    }
    await displayAlbums();
  } catch (error) {
    console.error("Error in main:", error);
  }

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  currentSong.addEventListener("ended", () => {
    play.src = "images/play.svg";
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  currentSong.addEventListener("timeupdate", () => {
    const seekbar = document.querySelector(".seekbar");
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    seekbar.style.background = `linear-gradient(to right, #14D4FF ${percent}%, #000000 ${percent}%)`;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("images/volume.svg")) {
      e.target.src = e.target.src.replace(
        "images/volume.svg",
        "images/mute.svg"
      );
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace(
        "images/mute.svg",
        "images/volume.svg"
      );
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 0]);
    }
  });
}
main();
