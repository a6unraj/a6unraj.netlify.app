new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      tracks: [
           {
          name: "Meenaxi - Dhuan Dhuan",
          artist: "Asha Bhosle, A.R.Rahman",
          cover: "Dhuan%20Dhuan.jpg",
          source: "https://arunraj.me/mp3/Dhuan Dhuan.mp3",
          url: "https://www.youtube.com/watch?v=KVX5vorVLzg",
          favorited: false
        },
          {
          name: "Cobra - Thumbi Thullal",
          artist: "Nakul Abhyankar, Shreya Ghoshal, A.R.Rahman",
          cover: "Thumbi%20Thullal.jpg",
          source: "https://arunraj.me/mp3/Thumbi%20Thullal.mp3",
          url: "https://www.youtube.com/watch?v=Dj6DPX53Vfk",
          favorited: false
        },
          {
          name: "Pudhupettai - Oru Naalil",
          artist: "Yuvan Shankar Raja",
          cover: "Oru%20naalil.jpg",
          source: "https://arunraj.me/mp3/Oru%20naalil.mp3",
          url: "https://www.youtube.com/watch?v=QQzwEXUDosI",
          favorited: false
        },
          {
          name: "Kaadhal 2 Kalyanam - Enakkaga Unakkaga",
          artist: "Naresh Iyer, Andrea Jeremiah, Yuvan Shankar Raja",
          cover: "Enakkaga%20Unakkaga.jpg",
          source: "https://arunraj.me/mp3/Enakkaga%20Unakkaga.mp3",
          url: "https://www.youtube.com/watch?v=O5UjBbpXNkM",
          favorited: false
        },
          {
          name: "Billa 2 - Idhayam",
          artist: "Shweta Pandit, Yuvan Shankar Raja",
          cover: "Idhayam.jpg",
          source: "https://arunraj.me/mp3/Idhayam.mp3",
          url: "https://www.youtube.com/watch?v=n9D5lCUDcAc",
          favorited: false
        },
          {
          name: "Ala Vaikunthapurramuloo - Samajavaragamana",
          artist: "Sid Sriram, Thaman.S.S",
          cover: "Samajavaragamana.jpg",
          source: "https://arunraj.me/mp3/Samajavaragamana.mp3",
          url: "https://www.youtube.com/watch?v=OCg6BWlAXSw",
          favorited: false
        },
        {
          name: "Kizhakku Cheemayile - Aathangara maramaey",
          artist: "Sujatha, Mano, A.R.Rahman",
          cover: "Aathangara%20maramaey.jpg",
          source: "https://arunraj.me/mp3/Aathangara maramaey.mp3",
          url: "https://www.youtube.com/watch?v=jUINWOhVneE",
          favorited: false
        },
        {
          name: "Rameswaram - Azhaigali Oasaigal",
          artist: "Haricharan, Kalyani, Niru",
          cover: "Alaigalin%20oosaigal.jpg",
          source: "https://arunraj.me/mp3/Alaigalin oosaigal.mp3",
          url: "https://www.youtube.com/watch?v=KVX5vorVLzg",
          favorited: false
        }
      ],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null
    };
  },
  methods: {
    play() {
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
    prevTrack() {
      this.transitionName = "scale-in";
      this.isShowCover = false;
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack() {
      this.transitionName = "scale-out";
      this.isShowCover = false;
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
      } else {
        this.currentTrackIndex = 0;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      setTimeout(() => {
        if(this.isTimerPlaying) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }, 300);
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[
        this.currentTrackIndex
      ].favorited;
    }
  },
  created() {
    let vm = this;
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;
    this.audio.ontimeupdate = function() {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function() {
      vm.generateTime();
    };
    this.audio.onended = function() {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement('link');
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image"
      document.head.appendChild(link)
    }
  }
});