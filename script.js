"use strict"

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
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
        cachedData: {},
        activeDay: null
        }
    },

    created() {
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
        nextYear() {
            this.sources.moon.apiOptions.year++;
            this.getMoonData();
        },
        prevYear() {
            this.sources.moon.apiOptions.year--;
            this.getMoonData();
        },
        gotoCurrentYear() {
            this.sources.moon.apiOptions.year = this.currentYear;
            this.getMoonData();
        },
        setHash() {
            if (this.moonPhases.year) {
                window.location.hash = this.moonPhases.year;
            }
        },
        getMoonData() {
            const api = this.sources.moon;
            const year = api.apiOptions.year;

            if (year == this.moonPhases.year) {
                console.log('year already on display...');
                return null;
            } else if (year < this.minYear || year > this.maxYear) {
                this.setError(`Year must be between ${this.minYear} and ${this.maxYear}`);
                console.log('Year out of range');
                return null;
            }

            if (this.cachedData[year]) {
                // fetch from cache
                this.moonPhases = this.cachedData[year]
                console.log('pulling data from cache', year);
                this.setHash();
                
                // Pre-fetch adjacent years for smooth transitions
                this.prefetchAdjacentYears(year);
            } else {
                // fetch new data
                console.log('fetching data from api...', year);
                this.fetchData(api);
            }

        },
        prefetchAdjacentYears(year) {
            const prevYear = year - 1;
            const nextYear = year + 1;
            
            // Fetch previous year if not cached and in range
            if (!this.cachedData[prevYear] && prevYear >= this.minYear) {
                console.log('pre-fetching previous year:', prevYear);
                this.fetchData({ 
                    ...this.sources.moon, 
                    apiOptions: { year: prevYear } 
                }, true);
            }
            
            // Fetch next year if not cached and in range
            if (!this.cachedData[nextYear] && nextYear <= this.maxYear) {
                console.log('pre-fetching next year:', nextYear);
                this.fetchData({ 
                    ...this.sources.moon, 
                    apiOptions: { year: nextYear } 
                }, true);
            }
        },
        cacheData() {
            if (this.moonPhases && !this.cachedData[this.moonPhases.year]) {
                this.cachedData[this.moonPhases.year] = this.moonPhases;
                console.log('adding data to cache', this.moonPhases.year);
                window.localStorage.setItem(this.localStorage, JSON.stringify(this.cachedData));
                console.log('Adding cache data to local storage...');
            }
        },
        async fetchData(source, isBackground = false) {
            const url = source.apiURL + source.apiOptions.year;
            
            if (!isBackground) {
                this.loading = true;
            }
            
            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.loadData(data, source.apiOptions.year, url, isBackground);
            } catch (error) {
                if (!isBackground) {
                    this.setError(`There was an error connecting to the data api! ${error.message}`);
                } else {
                    console.log(`Background fetch failed for ${source.apiOptions.year}:`, error.message);
                }
            } finally {
                if (!isBackground) {
                    this.loading = false;
                }
            }
        },
        loadData(data, year, url, isBackground = false) {

            if (undefined !== data) {
                const moonData = {
                    year: year,
                    phasedata: data
                };
                
                if (!isBackground) {
                    this.moonPhases = moonData;
                    this.setHash();
                }
                
                // Always cache the data
                if (!this.cachedData[year]) {
                    this.cachedData[year] = moonData;
                    console.log('adding data to cache', year);
                    window.localStorage.setItem(this.localStorage, JSON.stringify(this.cachedData));
                }
                
                console.log('data loaded into app from: ', url);
            } else {
                console.log('loaded data is undefined!');
            }
        },
        setError(msg) {
            this.moonPhases = {
                error: true,
                type: msg
            }
        },
        parsePhaseDate(raw) {
            // 2018 Jan 03
            const date = raw.toLowerCase().split(' ');
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

            date[1] = months.indexOf(date[1]) + 1;
            if (date[1] < 10) date[1] = "0" + date[1];
            return date.join('-');
        },
        setActiveDay(day) {
            if (this.activeDay === day.date) { 
                this.activeDay = null; 
            } else {
                this.activeDay = day.date;
            }
        }
    },

    watch: {
        // whenever moonPhases is updated cache the data
        moonPhases(val, oldVal) {
            this.cacheData();
        }
    },

    computed: {
        year() {
            return (this.moonPhases) ? this.moonPhases.year : this.sources.moon.apiOptions.year;
        },
        cycleStyle() {
            if (31 === this.longestCycle) return null;
            return {
                gridTemplateColumns: `repeat(${this.longestCycle}, 1fr)`
            }
        },
        newMoons() {
            const out = [];
            for (let i = 0; i < this.moonPhases.length; i++) {
                if (0 === this.moonPhases[i].Phase) {
                    out.push(this.moonPhases[i]);
                }
            }
            return out;
        },
        cycles() {
            const out = [];
            const currentYearPhases = this.moonPhases.phasedata;
            const currentYear = this.moonPhases.year;
            
            // Gather moon phases from current and adjacent years
            let allPhases = [...currentYearPhases];
            
            // Get last 4 phases from previous year if available
            const prevYear = currentYear - 1;
            if (this.cachedData[prevYear]) {
                const prevPhases = this.cachedData[prevYear].phasedata;
                allPhases = [...prevPhases.slice(-4), ...currentYearPhases];
            }
            
            // Get first 4 phases from next year if available
            const nextYear = currentYear + 1;
            if (this.cachedData[nextYear]) {
                const nextPhases = this.cachedData[nextYear].phasedata;
                allPhases = [...allPhases, ...nextPhases.slice(0, 4)];
            }
            
            // Find first new moon in our combined dataset
            let startIndex = allPhases.findIndex(phase => phase.Phase === 0);
            if (startIndex === -1) startIndex = 0;
            
            const start = allPhases[startIndex].Date + 'Z';
            const date = new Date(start);
            let cycle = [];
            let nextPhase = 'new-first';
            let i = startIndex;

            while (i < allPhases.length) {
                const day = {
                    date: new Date(date),
                    day: date.getDate(),
                    weekDay: date.getDay(),
                    month: date.getMonth(),
                    time: false,
                    year: date.getFullYear(),
                    phase: 'none',
                    morning: null,
                    afternoon: null,
                    evening: null,
                    currentYear: (date.getFullYear() === currentYear)
                };

                // Check if we have more phase data to process
                if (i < allPhases.length) {
                    const phaseDate = new Date(allPhases[i].Date + 'Z');

                    if (phaseDate == "Invalid Date") {
                        console.log(day, allPhases[i].Date, allPhases[i].Date);
                        break;
                    }

                    if (phaseDate.toDateString() == date.toDateString()) {

                        switch (allPhases[i].Phase) {
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
                        if (0 == allPhases[i].Phase) {
                            if (i > startIndex && cycle.length > 0 && cycle[0].phase == 'new') {
                                cycle.push(day);
                                
                                // Only include cycles that have days from current year
                                // But exclude cycles that end with a new moon on Jan 1st of current year
                                // (that new moon will be the start of the next cycle)
                                const hasCurrentYearDays = cycle.some(d => d.year === currentYear);
                                const endsWithJan1NewMoon = day.month === 0 && day.day === 1 && day.year === currentYear;
                                
                                if (hasCurrentYearDays && !endsWithJan1NewMoon) {
                                    out.push(cycle);
                                    // mesure cycle
                                    this.longestCycle = (cycle.length > this.longestCycle) ? cycle.length : this.longestCycle;
                                }
                            }
                            // reset cycle
                            cycle = [];
                        }

                        i++; // move to next moon phase
                    } else {
                        // not a moon phase
                        day.phase = nextPhase;
                    }
                } else {
                    // No more phase data, continue with last known phase
                    day.phase = nextPhase;
                }

                // Always add days during construction
                cycle.push(day);
                date.setDate(date.getDate() + 1);
            } // end while loop

            return out;
        }
    },
});

app.mount('#main');

window.addEventListener('keyup', function (e) {
    const key = e.key;

    if (key === 'ArrowLeft') {
        app.prevYear();
    } else if (key === 'ArrowRight') {
        app.nextYear();
    }
});
