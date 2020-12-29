"use strict"

Vue.component("day", {
    props: ["moon"],
    template: `

  `,
    data: function () {
        return {
            isSelected: false
        }
    },
    methods: {
    }
});

var app = new Vue({
    el: "#main",
    data: {
        currentYear: new Date().getFullYear(),
        today: new Date().toDateString(),
        displayYear: null,
        sources: {
            moon: {
                name: "Moon Phase",
                apiURL: "https://craigchamberlain.github.io/moon-data/api/moon-phase-data/",
                data: "moonPhases",
                apiOptions: {
                    year: new Date().getFullYear()
                }
            }
        },
        minYear: 1700,
        maxYear: 2100,
        longestCycle: 31,
        months: ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec'],
        weeks: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        moonPhases: false,
        localStorage: 'moonCache',
        loading: false,
        cachedData: {}
    },

    created: function () {
        // pull from local storage
        if (window.localStorage.moonCache) {
            this.cachedData = JSON.parse(window.localStorage.getItem(this.localStorage))
            console.log('Local data loaded...', this.cachedData);
        }

        // if the URL hash is between the min and max used that for year
        if (window.location.hash.substr(1) > this.minYear && window.location.hash.substr(1) < this.maxYear) {
            this.sources.moon.apiOptions.year = window.location.hash.substr(1);
        }

        // load in data
        this.getMoonData();
    },

    methods: {
        nextYear: function () {
            this.sources.moon.apiOptions.year++;
            this.getMoonData();
        },
        prevYear: function () {
            this.sources.moon.apiOptions.year--;
            this.getMoonData();
        },
        gotoCurrentYear: function () {
            this.sources.moon.apiOptions.year = this.currentYear;
            this.getMoonData();
        },
        setHash: function () {
            if (this.moonPhases.year) {
                window.location.hash = this.moonPhases.year;
            }
        },
        getMoonData: function () {
            var api = this.sources.moon,
                year = api.apiOptions.year;

            if (year == this.moonPhases.year) {
                console.log('year already on display...');
                return null;
            } else if (year < this.minYear || year > this.maxYear) {
                this.setError('Year must be between ' + this.minYear + ' and ' + this.maxYear);
                console.log('Year out of range');
                return null;
            }

            if (this.cachedData[year]) {
                // fetch from cache
                this.moonPhases = this.cachedData[year]
                console.log('pulling data from cache', year);
                this.setHash();
            } else {
                // fetch new data
                console.log('fetching data from api...', year);
                this.fetchData(api);
            }

        },
        cacheData: function () {
            if (this.moonPhases && !this.cachedData[this.moonPhases.year]) {
                this.cachedData[this.moonPhases.year] = this.moonPhases;
                console.log('adding data to cache', this.moonPhases.year);
                window.localStorage.setItem(this.localStorage, JSON.stringify(this.cachedData));
                console.log('Adding cache data to local storage...');
            }
        },
        fetchData: function (source) {
            var xhr = new XMLHttpRequest(),
                self = this,
                url = source.apiURL + source.apiOptions.year;

            this.loading = true;
            xhr.addEventListener("progress", updateProgress);

            xhr.open('GET', url);
            xhr.onload = function () {
                self.loading = false;
                self.loadData(xhr, source.apiOptions.year);
            };
            xhr.onerror = function () {
                self.setError('There was an error connecting to the data api! Status Code: ' + xhr.status + ' Message: ' + xhr.statusText);
            };
            xhr.send(null);
        },
        loadData: function (xhr, year) {
            var data = JSON.parse(xhr.responseText);

            if (undefined !== data) {
                this.moonPhases = {
                    year: year,
                    phasedata: data
                };
                console.log('data loaded into app from: ', xhr.responseURL, xhr);
                this.setHash();
            } else {
                console.log('loaded data is undefined!', xhr);
            }
        },
        setError: function (msg) {
            this.moonPhases = {
                error: true,
                type: msg
            }
        },
        parsePhaseDate: function (raw) {
            // 2018 Jan 03
            var date = raw.toLowerCase().split(' '),
                months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

            date[1] = months.indexOf(date[1]) + 1;
            if (date[1] < 10) date[1] = "0" + date[1];
            return date.join('-');
        }
    },

    watch: {
        // whenever moonPhases is updated cache the data
        moonPhases: function (val, oldVal) {
            this.cacheData();
        }
    },

    computed: {
        year: function () {
            return (this.moonPhases) ? this.moonPhases.year : this.sources.moon.apiOptions.year;
        },
        cycleStyle: function () {
            if (31 === this.longestCycle) return null;
            return {
                gridTemplateColumns: 'repeat(' + this.longestCycle + ', 1fr)'
            }
        },
        newMoons: function () {
            var out = [];
            for (var i = 0; i < this.moonPhases.length; i++) {
                if (0 === this.moonPhases[i].Phase) {
                    out.push(this.moonPhases[i]);
                }
            }
            return out;
        },
        cycles: function () {
            var out = [],
                moonPhases = this.moonPhases.phasedata,
                start = moonPhases[0].Date + 'Z',
                end = moonPhases[moonPhases.length - 1].Date + 'Z',
                date = new Date(start),
                endDate = new Date(end),
                cycle = [],
                nextPhase = 'new-first',
                i = 0;

            while (date <= endDate) {
                var day = {
                    date: new Date(date),
                    day: date.getDate(),
                    weekDay: date.getDay(),
                    month: date.getMonth(),
                    time: false,
                    year: date.getFullYear(),
                    phase: 'none',
                    morning: null,
                    afternoon: null,
                    evening: null
                };

                var phaseDate = new Date(moonPhases[i].Date + 'Z');

                if (phaseDate == "Invalid Date") {
                    console.log(day, moonPhases[i].Date, moonPhases[i].Date);
                    break;
                }

                if (phaseDate.toDateString() == date.toDateString()) {

                    switch (moonPhases[i].Phase) {
                        case 0:
                            day.phase = 'new';
                            nextPhase = 'new-first';
                            break;
                        case 1:
                            day.phase = 'first';
                            nextPhase = 'first-full';
                            break;
                        case 2:
                            day.phase = 'full';
                            nextPhase = 'full-last';
                            break;
                        case 3:
                            day.phase = 'last';
                            nextPhase = 'last-new';
                            break;
                        default:
                    }

                    day.date = new Date(phaseDate);
                    day.time = {
                        hours: day.date.getHours(),
                        minutes: (day.date.getMinutes() < 10 ? '0' : '') + day.date.getMinutes()
                    };

                    // if it's a new moon, start the new phase
                    if (0 == moonPhases[i].Phase) {
                        if (i > 0 && cycle[0].phase == 'new') {
                            cycle.push(day);
                            out.push(cycle);
                        }
                        // mesure cycle
                        this.longestCycle = (cycle.length > this.longestCycle) ? cycle.length : this.longestCycle;
                        // reset cycle
                        cycle = [];
                    }

                    i++; // move to next moon phase
                } else {
                    // not a moon phase
                    day.phase = nextPhase;
                }

                cycle.push(day);
                date.setDate(date.getDate() + 1);
            } // end while loop

            return out;
        }
    },
});

window.addEventListener('keyup', function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == 37) { // left
        app.prevYear();
    } else if (key == 39) { // right
        app.nextYear();
    }
});

function serialize(obj) {
    return '?' + Object.keys(obj).reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(obj[k])); return a
    },
        []).join('&')
}

Date.prototype.addDay = function () {
    this.setDate(this.getDate() + 1);
}

function updateProgress(e) {
    console.log(e.loaded);
}
