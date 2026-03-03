# **App Name**: Fara Manipulare

## Core Features:

- Economic Calendar Data Aggregation: Automatically fetch economic calendar news from investing.com and forexfactory, standardize it, and store it in a MongoDB database. All event times will be converted and displayed in Bucharest, Romania time.
- AI Weekly Market Overview: Utilize the Groq AI agent tool (via provided API key) to analyze the week's aggregated economic calendar data and generate a high-level market outlook with an associated 'success probability' percentage, displayed in a clear 'Week Overview' format.
- AI Daily Market Analysis: Upon selecting a specific day from the weekly overview, the Groq AI agent tool will provide a concise analysis for that day, including key factors and a potential market bias.
- Live Market News Ticker: Integrate with the Finnhub API (using the provided API key) to display a continuous, live scrolling bar of market news at the bottom of the website.
- Local Time & Data Update Tracker: Display the current time for Bucharest, Romania in the header and a tracker indicating the last time the economic calendar data was successfully updated.
- Interactive Economic Calendar Display: Present the economic calendar events with daily groupings, filterable by impact level (All, High, Medium, Low), as depicted in the reference image.
- Intuitive User Interface: Develop a responsive user interface that is 1:1 identical to the provided image, ensuring seamless navigation and clear presentation of data and AI analysis.

## Style Guidelines:

- Background color: Very dark charcoal with a subtle purple tint (#1F1C21), providing a professional and data-focused base for the dark scheme.
- Primary accent color: A sophisticated, muted deep purple (#694E8C), used for interactive elements like buttons, active states, and key branding highlights.
- Secondary accent color: A mid-tone blue-violet (#7A7FCC), offering complementary contrast for textual links, minor emphasis areas, and iconography.
- Body and headline font: 'Inter' (sans-serif) for its modern, neutral, and highly legible characteristics, suitable for conveying technical and financial information.
- Clean, simple, and modern line-art style icons that align with the professional and tech-driven aesthetic of the application, consistent with the provided image.
- A structured two-column main layout with a persistent left sidebar for AI analysis and a right scrollable content area for the economic calendar and weekly overview. A fixed top navigation bar with filters and real-time data, and a dedicated bottom bar for the live market news ticker.
- Subtle and smooth transitions for interactive elements, such as hover effects on buttons, seamless loading indicators during AI analysis, and smooth content reveals.