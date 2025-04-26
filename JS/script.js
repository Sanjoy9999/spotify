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
  
    // Assuming songs are in a directory under '/songs/'
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let as = div.getElementsByTagName("a");
    songs = [];
  
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }
  
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
  
    for (const song of songs) {
      songUL.innerHTML += `
        <li>
          <img class="invert" width="34" src="images/music.svg" alt="">
          <div class="info">
            <div>${decodeURIComponent(song.replaceAll("%20", " "))}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg" alt="">
          </div>
        </li>`;
    }
  
    // Attach click event to each song
    Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info div").innerText.trim());
      });
    });
  
    return songs;
  }
  


const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};



async function displayAlbums() {
  let response = await fetch('/songs/');
  let text = await response.text();

  let div = document.createElement("div");
  div.innerHTML = text;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  for (let anchor of anchors) {
    // Extract the href
    let href = anchor.href;

    // Only consider valid album folder links
    if (href.includes("/songs/") && !href.endsWith("/")) {
      // Get the folder name from the URL
      let folder = href.split("/").slice(-1)[0];

      // Skip the root "songs" folder itself
      if (folder === "songs") continue;

      console.log(`Extracted folder name: ${folder}`);

      try {
        let albumInfo = await fetch(`/songs/${folder}/info.json`);

        if (!albumInfo.ok) {
          throw new Error(`Could not fetch info.json for folder: ${folder}. Status: ${albumInfo.status}`);
        }

        let albumData = await albumInfo.json();

        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"></path>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="Album cover for ${albumData.title}">
            <h2>${albumData.title}</h2>
            <p>${albumData.description}</p>
          </div>`;
      } catch (error) {
        console.error(`Error fetching album info for folder: ${folder}. Error:`, error);
      }
    }
  }

  // Attach click event to load playlist when an album is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder;
      songs = await getSongs(`songs/${folder}`);
      playMusic(songs[0]);  // Play the first song when the album is clicked
    });
  });
}



async function main() {
  // Get the list of all the songs
  await getSongs("songs/AChill_songs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

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
