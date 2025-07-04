'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helper = function () {
    function Helper() {
        _classCallCheck(this, Helper);
    }

    Helper.objectToMatrix = function objectToMatrix(obj, cols) {
        var matrix = [],
            i = 0,
            len = obj.length,
            k = -1;
        while (i < len) {
            if (i % cols === 0) {
                k++;
                matrix[k] = [];
            }
            matrix[k].push(obj[i]);
            i++;
        }
        return matrix;
    };

    Helper.render = function render(fps, _render) {
        var fpsInterval = undefined,
            startTime = undefined,
            now = undefined,
            then = undefined,
            elapsed = undefined;

        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;

        (function animate() {
            requestAnimationFrame(animate);
            now = Date.now();
            elapsed = now - then;
            if (elapsed > fpsInterval) {
                then = now - elapsed % fpsInterval;
                _render();
            }
        })();
    };

    Helper.hasClass = function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    };

    Helper.addClass = function addClass(el, className) {
        if (el instanceof HTMLElement) {
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        } else {
            for (var i = 0, len = el.length; i < len; i++) {
                if (el[i].classList) {
                    el[i].classList.add(className);
                } else {
                    el[i].className += ' ' + className;
                }
            }
        }
    };

    Helper.removeClass = function removeClass(el, className) {
        if (el instanceof HTMLElement) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        } else {
            for (var i = 0, len = el.length; i < len; i++) {
                if (el[i].classList) {
                    el[i].classList.remove(className);
                } else {
                    el[i].className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            }
        }
    };

    Helper.closest = function closest(el, selector) {
        var matchesFn = undefined;
        ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
            if (typeof document.body[fn] == 'function') {
                matchesFn = fn;
                return true;
            }
            return false;
        });

        var parent = undefined;
        while (el) {
            parent = el.parentElement;
            if (parent && parent[matchesFn](selector)) {
                return parent;
            }
            el = parent;
        }

        return null;
    };

    _createClass(Helper, null, [{
        key: 'click',
        get: function get() {
            return navigator.userAgent.match(/iPad/i) ? 'touchstart' : 'click';
        }
    }]);

    return Helper;
}();

var MusicPlayer = function () {
    function MusicPlayer(ctx, opts) {
        _classCallCheck(this, MusicPlayer);

        this.ctx = ctx;
        this.divider = this.constructor.DEFAULTDIVIDER;
        this.filter = this.constructor.DEFAULTFILTER;

        if (_typeof(opts.tracks) === 'object') {
            this.makeTracks(opts.tracks);
        }
        this.track = document.querySelector('.track');

        this.audioSetup().tracklistControls().loadTrack().render().playCurrentTrack().changeVolume().changeTrack().events();
        if (typeof opts.autoplay === 'boolean' && opts.autoplay) {
            this.playTrack();
        }
    }

    MusicPlayer.prototype.audioSetup = function audioSetup() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var audio = document.getElementById('mp3');
        var src = audioCtx.createMediaElementSource(audio);
        var analyser = audioCtx.createAnalyser();
        var data = new Uint8Array(analyser.frequencyBinCount);

        src.crossOrigin = 'anonymous';
        src.connect(analyser);
        analyser.connect(audioCtx.destination);

        this.audio = {
            ctx: audioCtx,
            el: audio,
            src: src,
            analyser: analyser,
            data: data
        };

        return this;
    };

    MusicPlayer.prototype.render = function render() {
        var Player = this;
        Helper.render(60, function () {
            if (!Player.audio.el.paused) {
                Player.audio.analyser.getByteFrequencyData(Player.audio.data);
                var data = Helper.objectToMatrix(Player.audio.data, Player.divider);
                var y = data.length,
                    x = Player.divider;
                while (y--) {
                    while (x--) {
                        var alpha = data[y][x];
                        if (alpha - Player.filter > 0) {
                            alpha = (alpha - Player.filter) / 255;
                        } else {
                            alpha = 0;
                        }
                        Player.ctx.clearRect(x * Player.w, y * Player.h, Player.w, Player.h);
                        Player.ctx.fillStyle = 'rgba(0,136,204,' + alpha + ')';
                        Player.ctx.fillRect(x * Player.w, y * Player.h, Player.w, Player.h);
                    }
                    x = Player.divider;
                }
            }
        });
        return this;
    };

    MusicPlayer.prototype.playCurrentTrack = function playCurrentTrack() {
        var playing = false,
            playel = document.getElementById('play'),
            Player = this;

        playel.addEventListener(Helper.click, function (e) {
            if (Helper.hasClass(Player.track, 'active')) {
                Player.pauseTrack();
            } else {
                Player.playTrack();
            }
        });

        return Player;
    };

    MusicPlayer.prototype.changeVolume = function changeVolume() {
        var volume = document.getElementById('volume'),
            Player = this;
        volume.addEventListener('input', function () {
            Player.audio.el.volume = this.value / 100;
        });
        volume.addEventListener('change', function () {
            Player.audio.el.volume = this.value / 100;
        });

        return this;
    };

    MusicPlayer.prototype.tracklistControls = function tracklistControls() {
        var control = document.getElementById('tracklist-control');
        var tracklist = document.getElementById('tracklist');
        control.addEventListener(Helper.click, function (e) {
            var parent = Helper.closest(e.target, '.track-list');
            if (Helper.hasClass(parent, 'active')) {
                Helper.removeClass(parent, 'active');
            } else {
                Helper.addClass(parent, 'active');
            }
        });
        return this;
    };

    MusicPlayer.prototype.makeTrack = function makeTrack(track, i) {
        var t = document.createElement('div');
        t.setAttribute('track-number', i);
        t.setAttribute('audio-src', track.src);
        t.setAttribute('artist', track.artist);
        Helper.addClass(t, 'track');

        var icon = document.createElement('i');
        Helper.addClass(icon, 'material-icons');
        icon.appendChild(document.createTextNode('play_circle_outline'));

        var name = document.createElement('span');
        name.appendChild(document.createTextNode(track.name));

        t.appendChild(icon);
        t.appendChild(name);

        return t;
    };

    MusicPlayer.prototype.makeTracks = function makeTracks(tracks) {
        var tracklist = document.querySelector('.track-list');
        for (var i = 0, len = tracks.length; i < len; i++) {
            tracklist.appendChild(this.makeTrack(tracks[i], i));
        }
        this.tracks = tracks;
    };

    MusicPlayer.prototype.changeTrack = function changeTrack() {
        var Player = this;
        for (var i = 0, len = Player.tracks.length; i < len; i++) {
            Player.tracks[i].addEventListener(Helper.click, function (e) {
                if (Helper.hasClass(e.target, 'track')) {
                    if (Player.track != e.target) {
                        Player.track = e.target;
                    }

                    if (Helper.hasClass(e.target, 'active')) {
                        Player.pauseTrack();
                    } else {
                        Player.loadTrack(true);
                        Helper.removeClass(Helper.closest(e.target, '.track-list'), 'active');
                    }
                }
                e.stopPropagation();
                return false;
            });
        }

        return this;
    };

    MusicPlayer.prototype.playPreviousTrack = function playPreviousTrack() {
        var current = parseInt(this.track.getAttribute('track-number'));
        var previous = current <= 0 ? this.tracks.length - 1 : current - 1;
        this.track = this.tracks[previous];
        this.loadTrack(true);

        return this;
    };

    MusicPlayer.prototype.playNextTrack = function playNextTrack() {
        var current = parseInt(this.track.getAttribute('track-number'));
        var next = current > this.tracks.length ? 0 : current + 1;
        this.track = this.tracks[next];
        this.loadTrack(true);

        return this;
    };

    MusicPlayer.prototype.shuffle = function shuffle() {
        var tracknumber = Math.floor(Math.random() * this.tracks.length);
        while (tracknumber == parseInt(this.track.getAttribute('track-number'))) {
            tracknumber = Math.floor(Math.random() * this.tracks.length);
        }
        this.track = this.tracks[tracknumber];
        this.loadTrack(true);

        return this;
    };

    MusicPlayer.prototype.loadTrack = function loadTrack(autoplay) {
        this.audio.el.removeAttribute('src');
        this.audio.el.setAttribute('src', this.track.getAttribute('audio-src'));
        // this.audioSetup();

        var artist = document.querySelector('.track-artist');
        var name = document.querySelector('.track-name');

        artist.innerText = this.track.getAttribute('artist');
        name.innerText = this.track.querySelector('span').innerText;

        if (typeof autoplay === 'boolean' && autoplay) {
            this.playTrack();
        }

        return this;
    };

    MusicPlayer.prototype.playTrack = function playTrack() {
        Helper.removeClass(this.tracks, 'active');
        var icons = document.getElementById('tracklist').querySelectorAll('.material-icons');
        for (var j = 0, jlen = icons.length; j < jlen; j++) {
            icons[j].innerHTML = 'play_circle_outline';
        }

        Helper.addClass(this.track, 'active');
        this.track.querySelector('.material-icons').innerHTML = 'pause_circle_outline';
        this.audio.el.play();
        this.audio.el.crossOrigin = 'anonymous';
        this.audio.el.volume = volume.value / 100;
        document.getElementById('play').setAttribute('playing', 'playing');

        var Player = this;
        this.audio.el.addEventListener('ended', function () {
            Player.audio.el.currentTime = 0;
            Player.audio.el.pause();
            if (Player.shuffling) {
                Player.shuffle();
            } else {
                if (parseInt(Player.audio.el.getAttribute('track-number')) < Player.tracks.length) {
                    Player.playNextTrack();
                } else {
                    if (Player.repeating) {
                        Player.playNextTrack();
                    }
                }
            }
        });
    };

    MusicPlayer.prototype.pauseTrack = function pauseTrack() {
        Helper.removeClass(this.track, 'active');
        this.track.querySelector('.material-icons').innerHTML = 'play_circle_outline';
        this.audio.el.pause();
        document.getElementById('play').removeAttribute('playing');

        return this;
    };

    MusicPlayer.prototype.events = function events() {
        var Player = this;
        document.querySelector('.shuffle').addEventListener(Helper.click, function (e) {
            Helper.removeClass(document.querySelectorAll('.controls div'), 'active');
            Player.repeating = false;
            if (Player.shuffling) {
                Player.shuffling = false;
            } else {
                Player.shuffling = true;
                Helper.addClass(e.target, 'active');
            }
        });
        document.querySelector('.repeat').addEventListener(Helper.click, function (e) {
            Helper.removeClass(document.querySelectorAll('.controls div'), 'active');
            Player.shuffling = false;
            if (Player.repeating) {
                Player.repeating = false;
            } else {
                Player.repeating = true;
                Helper.addClass(e.target, 'active');
            }
        });
        document.querySelector('.next').addEventListener(Helper.click, function () {
            Player.shuffling = false;
            Player.playNextTrack();
        });
        document.querySelector('.previous').addEventListener(Helper.click, function () {
            Player.shuffling = false;
            Player.playPreviousTrack();
        });
    };

    _createClass(MusicPlayer, [{
        key: 'ctx',
        get: function get() {
            return this._ctx;
        },
        set: function set(val) {
            this._ctx = val;
        }
    }, {
        key: 'divider',
        get: function get() {
            return this._divider;
        },
        set: function set(val) {
            this._divider = val;
        }
    }, {
        key: 'filter',
        get: function get() {
            return this._filter;
        },
        set: function set(val) {
            this._filter = val;
        }
    }, {
        key: 'w',
        get: function get() {
            return this.ctx.canvas.width / this.divider;
        }
    }, {
        key: 'h',
        get: function get() {
            return this.ctx.canvas.height / this.divider;
        }
    }, {
        key: 'audio',
        get: function get() {
            return this._audio;
        },
        set: function set(val) {
            this._audio = val;
        }
    }, {
        key: 'track',
        get: function get() {
            return this._track;
        },
        set: function set(val) {
            this._track = val;
        }
    }, {
        key: 'tracks',
        get: function get() {
            return this._tracks = document.querySelectorAll('.track');
        },
        set: function set(val) {
            this._tracks = val;
        }
    }, {
        key: 'shuffling',
        get: function get() {
            return this._shuffling;
        },
        set: function set(val) {
            this._shuffling = val;
        }
    }, {
        key: 'repeating',
        get: function get() {
            return this._repeating;
        },
        set: function set(val) {
            this._repeating = val;
        }
    }], [{
        key: 'DEFAULTDIVIDER',
        get: function get() {
            return 32;
        }
    }, {
        key: 'DEFAULTFILTER',
        get: function get() {
            return 0;
        }
    }]);

    return MusicPlayer;
}();

window.onload = function () {
    var tracklist = [
	{
        src: 'https://arunraj.eu/audio/Aathangara maramaey.mp3',
        name: 'Aathangara maramaey',
        artist: 'Kizhakku Cheemayile - A.R.Rahman'
    },
    	{
        src: 'https://arunraj.eu/audio/Alaigalin oosaigal.mp3',
        name: 'Alaigalin oosaigal',
        artist: 'Rameshwaram - Niru'
    },
	{
        src: 'https://arunraj.eu/audio/Anthaathi.mp3',
        name: 'Anthaathi',
        artist: '96 - Govind Vasantha Menon'
    },
	{
        src: 'https://arunraj.eu/audio/Azhagae sugamaa.mp3',
        name: 'Azhagae sugamaa',
        artist: 'Paarthale Paravasam - A.R.Rahman'
    },
	{
        src: 'https://arunraj.eu/audio/Azhagiya thimirudan.mp3',
        name: 'Azhagiya thimirudan',
        artist: 'Run - Vidyasagar'
    },
	{
        src: 'https://arunraj.eu/audio/Azhagu.mp3',
        name: 'Azhagu',
        artist: 'Saivam - G.V.Prakashkumar'
    },
	{
        src: 'https://arunraj.eu/audio/Azhaipaya Azhaipaya.mp3',
        name: 'Azhaipaya Azhaipaya',
        artist: 'Kaahdalil sodhappuvadhu eppadi - S.S.Thaman'
    },
	{
        src: 'https://arunraj.eu/audio/Beat of Sachein.mp3',
        name: 'Sachein - Beat of Sachein',
        artist: 'S.S.Thaman'
    },
	{
		src: 'https://arunraj.eu/audio/Boomiyil.mp3',
		name: 'Boomiyil',
		artist: 'Pizza II - Santhosh Narayanan'
	},
	{
		src: 'https://arunraj.eu/audio/Chillena.mp3',
		name: 'Chillena',
		artist: 'Raja Rani - G.V.Prakash Kumar'
	},
	{
		src: 'https://arunraj.eu/audio/Chinna chinnathaai.mp3',
		name: 'Chinna chinnathaai',
		artist: 'Mounam Pesiyathe - Yuvan Shankar Raja'
	},
	{
		src: 'https://arunraj.eu/audio/Chinnammaa.mp3',
		name: 'Chinnammaa',
		artist: 'Sakkarakatti - A.R.Rahman'
	},
	{
		src: 'https://arunraj.eu/audio/Edhuvaraiyo Edhuvaraiyo.mp3',
		name: 'Edhuvaraiyo Edhuvaraiyo',
		artist: 'Kolamaavu Kokila - anirudh Ravichander'
	},
	{
		src: 'https://arunraj.eu/audio/Enakkaga Unakkaga.mp3',
		name: 'Enakkaga Unakkaga',
		artist: 'Mounam Pesiyathe - Yuvan Shankar Raja'
	},	
	{
		src: 'https://arunraj.eu/audio/Gulmohar malare.mp3',
		name: 'Gulmohar malare',
		artist: 'Majnu - Harris Jayaraj'
	},
	{
		src: 'https://arunraj.eu/audio/Hafiz Hafiz.mp3',
		name: 'Hafiz Hafiz',
		artist: 'Laila Majnu - Niladri Kumar'
	},
	{
		src: 'https://arunraj.eu/audio/Hey goodbye nanba.mp3',
		name: 'Hey goodbye nanba',
		artist: 'Ayutha Ezhuthu - A.R.Rahman'
	},
	{
		src: 'https://arunraj.eu/audio/Idho Thaanaagave.mp3',
		name: 'Idho Thaanaagave',
		artist: 'Adhe Kangal - Ghibran'
	},
	{
		src: 'https://arunraj.eu/audio/Indha paadhai.mp3',
		name: 'Indha paadhai',
		artist: 'Aayirathil Oruvan - G.V.Prakash Kumar'
	},
	{
		src: 'https://arunraj.eu/audio/Infinite Love.mp3',
		name: 'Infinite Love',
		artist: 'Infinite Love - A.R.Rahman'
	},
	{
		src: 'https://arunraj.eu/audio/Kaadhal Vandhale.mp3',
		name: 'Kaadhal Vandhale',
		artist: 'Vallavan - Yuvan Shankar Raja'
	},
	{
		src: 'https://arunraj.eu/audio/Kaadhal.mp3',
		name: 'Kaadhal Theme Music',
		artist: 'Kaadhal - Joshua Sridhar'
	},
	{	
		src: 'https://arunraj.eu/audio/Kadavule Vidai.mp3',
		name: 'Kadavule Vidai',
		artist: 'Rum - Anirudh Ravichander'
	},
	{	
		src: 'https://arunraj.eu/audio/Kadhai Thiraikadhai Vasanam Iyakkam.mp3',
		name: 'Kadhai Thiraikadhai Vasanam Iyakkam',
		artist: 'Kadhai Thiraikadhai Vasanam Iyakkam - Vijay Antony'
	},
	{	
		src: 'https://arunraj.eu/audio/Kadhal Ara Onnu.mp3',
		name: 'Kadhal Ara Onnu',
		artist: 'Vayai Moodi Pesavum - Sean Roldan'
	},
	{	
		src: 'https://arunraj.eu/audio/Kadhal Onrallava (Tamil).mp3',
		name: 'Kadhal Onrallava (Tamil)',
		artist: 'One Love - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Kannana Kanne.mp3',
		name: 'Kannana Kanne',
		artist: 'Naanum Rowdy Than - Anirudh Ravichander'
	},
	{	
		src: 'https://arunraj.eu/audio/Kholo kholo.mp3',
		name: 'Kholo kholo',
		artist: 'Taare Zameen Par - Shankar Ehsaan Loy'
	},
	{	
		src: 'https://arunraj.eu/audio/Konjum mynakale.mp3',
		name: 'Konjum mynakale',
		artist: 'Kandukondaen Kandukondaen - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Makkayala.mp3',
		name: 'Makkayala',
		artist: 'Naan - Vijay Antony'
	},
	{	
		src: 'https://arunraj.eu/audio/Maname Maname.mp3',
		name: 'Maname Maname',
		artist: 'Vanmam - S.S.Thaman'
	},
	{	
		src: 'https://arunraj.eu/audio/Maruvaarthai.mp3',
		name: 'Maruvaarthai',
		artist: 'Enai Nokki Paayum Thotta - Darbuka Siva'
	},	
	{	
		src: 'https://arunraj.eu/audio/Mazhai Pozhiyum.mp3',
		name: 'Mazhai Pozhiyum',
		artist: 'Muppozhuthu Un Karpanaigal - G.V.Prakash Kumar'
	},
	{	
		src: 'https://arunraj.eu/audio/Mudhal Murai.mp3',
		name: 'Mudhal Murai',
		artist: 'Neethaane En Ponvasantham - Ilaiyaraja'
	},
	{	
		src: 'https://arunraj.eu/audio/Muththae Muthamma.mp3',
		name: 'Muththae Muthamma',
		artist: 'Ullasam - Karthick Raja'
	},
	{	
		src: 'https://arunraj.eu/audio/Naan Nee.mp3',
		name: 'Naan Nee',
		artist: 'Madras - Santhosh Narayanan'
	},
	{	
		src: 'https://arunraj.eu/audio/Naan Varaindhu.mp3',
		name: 'Naan Varaindhu',
		artist: 'Jayam Kondan - Vidyasagar'
	},
	{	
		src: 'https://arunraj.eu/audio/Nadhiyile.mp3',
		name: 'Nadhiyile',
		artist: 'Doo - Abhishek Lawrence'
	},
	{	
		src: 'https://arunraj.eu/audio/Nadodi Paattu.mp3',
		name: 'Nadodi Paattu',
		artist: 'Harichandra - Agosh'
	},
	{	
		src: 'https://arunraj.eu/audio/Naru naru narumugaye.mp3',
		name: 'Naru naru narumugaye',
		artist: 'Sundattam - Britto'
	},
	{	
		src: 'https://arunraj.eu/audio/Natpukkillai Ellai.mp3',
		name: 'Natpukkillai Ellai',
		artist: 'Rahul Raj - Oh My Friend'
	},
	{	
		src: 'https://arunraj.eu/audio/Nenjaankoottil.mp3',
		name: 'Nenjaankoottil',
		artist: 'Dishyum - Vijay Antony'
	},
	{	
		src: 'https://arunraj.eu/audio/Nenjae Yezhu.mp3',
		name: 'Nenjae Yezhu',
		artist: 'Maryan - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Netru No No.mp3',
		name: 'Netru No No',
		artist: 'V.I.P - Ranjith Barot'
	},
	{	
		src: 'https://arunraj.eu/audio/New.mp3',
		name: 'New',
		artist: 'New - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/No problem.mp3',
		name: 'No problem',
		artist: 'Love Birds - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Ore kana.mp3',
		name: 'Ore kana',
		artist: 'Guru - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Oruvan oruvan.mp3',
		name: 'Oruvan oruvan',
		artist: 'Muthu - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Pani vizhum kaalam.mp3',
		name: 'Pani vizhum kaalam',
		artist: 'Manathodu Mazhaikaalam - Karthick Raja'
	},
	{	
		src: 'https://arunraj.eu/audio/Patchai niramae.mp3',
		name: 'Patchai niramae',
		artist: 'Alaipayuthey - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Piya Milenge.mp3',
		name: 'Piya Milenge',
		artist: 'Raanjhanaa - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Podaa Podi.mp3',
		name: 'Podaa Podi',
		artist: 'Podaa Podi - Dharan Kumar'
	},
	{	
		src: 'https://arunraj.eu/audio/Poga poga.mp3',
		name: 'Poga poga',
		artist: 'Pattiyal - Yuvan Shankar Raja'
	},
	{	
		src: 'https://arunraj.eu/audio/Poovae punnagai.mp3',
		name: 'Poovae punnagai',
		artist: 'Parthaen Rasithaen - Bharadwaj'
	},
	{	
		src: 'https://arunraj.eu/audio/Pudhu vellai mazhai.mp3',
		name: 'Pudhu vellai mazhai',
		artist: 'Roja - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Rayile rayile.mp3',
		name: 'Rayile rayile',
		artist: '5 Star - Parasuram Radha'
	},
	{	
		src: 'https://arunraj.eu/audio/Saayndhu Saayndhu.mp3',
		name: 'Saayndhu Saayndhu',
		artist: 'Neethane En Ponvasantham - Ilaiyaraja'
	},
	{	
		src: 'https://arunraj.eu/audio/Sandhosa kanneray.mp3',
		name: 'Sandhosa kanneray',
		artist: 'Uyire - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Sariyaa idhu thavaraa.mp3',
		name: 'Sariyaa idhu thavaraa',
		artist: 'Kalloori - Joshua Sridhar'
	},
	{	
		src: 'https://arunraj.eu/audio/Sudum Nilavu.mp3',
		name: 'Sudum Nilavu',
		artist: 'Thambi - Vidyasagar'
	},
	{	
		src: 'https://arunraj.eu/audio/Theekuruvi.mp3',
		name: 'Theekuruvi',
		artist: 'Kangalaal Kaidhu Sei - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Thenmerkku.mp3',
		name: 'Thenmerkku',
		artist: 'Karuthamma - A.R.Rahman'
	},
	{	
		src: 'https://arunraj.eu/audio/Thenneeril snehidham.mp3',
		name: 'Thenneeril snehidham',
		artist: 'Subramanyapuram - James Vasnthan'
	},
	{	
		src: 'https://arunraj.eu/audio/Ussele ussele.mp3',
		name: 'Ussele ussele',
		artist: 'Ussele ussele - Srinivas'
	},
	{	
		src: 'https://arunraj.eu/audio/Uyirae en uyirae.mp3',
		name: 'Uyirae en uyirae',
		artist: 'Thotti Jaya - Harris Jayaraj'
	},
	{	
		src: 'https://arunraj.eu/audio/Uyire uyire.mp3',
		name: 'Uyire uyire',
		artist: 'Vanam Vasapadum - Mahesh'
	},
	{	
		src: 'https://arunraj.eu/audio/Vaan Engum Nee Minna.mp3',
		name: 'Vaan Engum Nee Minna',
		artist: 'Endrendrum Punnagai  - Harris Jayaraj'
	},
	{	
		src: 'https://arunraj.eu/audio/Vaanam vasapadume.mp3',
		name: 'Vaanam vasapadume',
		artist: 'Vanam Vasapadum - Mahesh'
	},
	{	
		src: 'https://arunraj.eu/audio/Vinmeen Vithayil.mp3',
		name: 'Vinmeen Vithayil',
		artist: 'Thegidi - Nivas.K.Prasanna'
	},
	{	
		src: 'https://arunraj.eu/audio/Vizhigalil Vizhundhavalo.mp3',
		name: 'Vizhigalil Vizhundhavalo',
		artist: 'Pugazh - Vivek-Mervin'
	},
	{	
		src: 'https://arunraj.eu/audio/Vizhigalin aruginil.mp3',
		name: 'Vizhigalin aruginil',
		artist: 'Azhagiya Theeye - Ramesh Vinayagam'
	},
	{	
		src: 'https://arunraj.eu/audio/Vizhiyile Vizhiyile.mp3',
		name: 'Vizhiyile Vizhiyile',
		artist: '555 - Simon'
	},
	{	
		src: 'https://arunraj.eu/audio/Yaarai Polum Illa.mp3',
		name: 'Yaarai Polum Illa',
		artist: 'Pencil - G.V.Prakash Kumar'
	}
	];
    var ctx = document.getElementById('canvas').getContext('2d');
    var player = new MusicPlayer(ctx, {
        tracks: tracklist
    });
};