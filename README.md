# Dark Moon Lunar Calendar 🌑

A visually striking lunar calendar web application that displays moon phases organized by lunar cycles. Unlike traditional calendars that organize by months, this calendar centers each row around the new moon, showing complete lunar cycles from new moon to new moon.

**Live Demo:** [darkmoon.dhornbein.com](https://darkmoon.dhornbein.com)

## Features

- 🌙 **Moon-Phase-Centered Calendar** - Each row represents a complete lunar cycle (new moon to new moon)
- 📅 **Historical Range** - View lunar data for any year between 1700 and 2100
- ⚡ **Local Caching** - Downloaded lunar data is cached in browser localStorage for instant access
- 📱 **Responsive Design** - Adapts to mobile, tablet, and desktop screens
- ⌨️ **Keyboard Navigation** - Use arrow keys (← →) to navigate between years
- 🕐 **Precise Timing** - Shows exact time (hours:minutes) for each moon phase event
- 🌓 **All Moon Phases** - Displays all eight moon phases: New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Last Quarter, Waning Crescent

## Technologies Used

- **Vue.js 2** - Reactive UI framework (loaded via CDN)
- **Vanilla JavaScript** - Core application logic
- **CSS Grid** - Modern layout for the calendar display
- **LocalStorage API** - Client-side caching
- **Moon Phase Data API** - [Craig Chamberlain's moon-data](https://craigchamberlain.github.io/moon-data)

## Installation & Usage

This is a static web application that requires no build process or server-side code.

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/dhornbein/dark-moon-rising.git
cd dark-moon-rising
```

2. Serve the files with any static web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Or simply open index.html in your browser
```

3. Open your browser and navigate to `http://localhost:8000` (or the port your server uses)

## How It Works

### Lunar Cycle Organization

Unlike traditional calendars that organize days by month, this calendar organizes days by **lunar cycles**. Each row starts with a new moon and ends just before the next new moon, showing approximately 29.5 days per cycle.

### Data Source

Lunar phase data is provided by [Craig Chamberlain's moon-data repository](https://github.com/CraigChamberlain/moon-data), which is based on data taken from The United States Naval Observatory (USNO) API before it was taken down for maintenance.

The application fetches data from: `https://craigchamberlain.github.io/moon-data/api/moon-phase-data/{year}`

### Caching Strategy

- When you first view a year, the data is fetched from the API
- The data is immediately stored in browser localStorage
- Subsequent visits to the same year load instantly from cache
- Cache persists between browser sessions

### Visual Design

- Moon phase emojis (🌑🌒🌓🌔🌕🌖🌗🌘) represent each phase
- Color intensity corresponds to moon illumination
- Full moons are highlighted in golden yellow (#e1bc4b)
- Interactive hover effects provide detailed information
- Current day is subtly highlighted

## Project Structure

```
dark-moon-calendar/
├── index.html          # Main HTML structure
├── main.css           # Styles and responsive design
├── script.js          # Vue application and lunar calculations
├── CNAME              # Custom domain configuration
└── README.md          # This file
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage for caching functionality

## Contributing

Contributions are welcome! Please feel free to submit pull requests for:
- Bug fixes
- UI/UX improvements
- New features
- Documentation improvements

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0)

## Author

**Drew Hornbein**

- Email: [moon@dhornbein.com](mailto:moon@dhornbein.com)
- Twitter: [@hornbein](https://twitter.com/hornbein)
- GitHub: [@dhornbein](https://github.com/dhornbein)

## Acknowledgments

- Moon phase data courtesy of [Craig Chamberlain's moon-data project](https://github.com/CraigChamberlain/moon-data)
- Original data from The United States Naval Observatory (USNO)
