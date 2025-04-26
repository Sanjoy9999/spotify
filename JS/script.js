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
    // Update path to use AChill_songs instead of songs/AChill_songs
    let a = await fetch(`./AChill_songs/`);
    let response = await a.text();

    if (!response) {
      throw new Error("No songs found");
    }

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        // Simplify path handling
        songs.push(element.href.split("/").pop());
      }
    }
    return songs;
  } catch (error) {
    console.error("Error loading songs:", error);
    return [];
  }
}

const playMusic = (track, pause = false) => {
  try {
    // Simplify path handling
    currentSong.src = `./${currFolder}/${track}`;
    if (!pause) {
      currentSong.play();
      play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  } catch (error) {
    console.error("Error playing music:", error);
  }
};

async function displayAlbums() {
  try {
    // Use direct folder names instead of songs/
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

    // Attach click events to cards
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
    // Start with AChill_songs directly
    await getSongs("AChill_songs");
    if (songs && songs.length > 0) {
      playMusic(songs[0], true);
    }
    await displayAlbums();
  } catch (error) {
    console.error("Error in main:", error);
  }

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  // Handling song end event to reset the play button icon
  currentSong.addEventListener("ended", () => {
    play.src = "images/play.svg"; // Set to play icon when song ends
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next song
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
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

  // Change seekbar color according to song play
  currentSong.addEventListener("timeupdate", () => {
    const seekbar = document.querySelector(".seekbar");
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    seekbar.style.background = `linear-gradient(to right, #14D4FF ${percent}%, #000000 ${percent}%)`;
  });

  // Add event listener to mute the track
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

  //Add one song finish after another song automatically plays
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event listener to the "ended" event of the current song
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 0]);
    }
  });
}
main();
