# **App Name**: EHRI Dashboard

## Core Features:

- Dashboard Layout & Navigation: Displays the overall clean analytics dashboard interface, incorporating a responsive grid layout for desktop and stacked layout for mobile, with the project title and tagline in the header. Includes the city selection dropdown.
- City Data Loading & Management: Simulates API calls to load specific city data using mock data with a simulated delay (setTimeout). Implements loading spinners for data fetching and 'data unavailable' UI for fallback scenarios.
- EHRI Risk Gauge: Visualizes the Environmental Health Risk Index (EHRI) using a radial or semicircle gauge, displaying the numeric score prominently and coloring the gauge dynamically based on predefined risk ranges (Green, Yellow, Orange, Red) with smooth animations.
- Risk Breakdown Bars: Presents pollution stress, heat stress, and humidity stress levels as horizontal, color-coded progress bars with percentage format and smooth transitions, providing a quick visual breakdown of environmental factors.
- Feature Importance Chart: A bar chart component to visually represent the importance of key environmental factors like PM2.5, Temperature, and Humidity in contributing to the overall EHRI score.
- AI Explanation Panel: Displays an AI-generated textual explanation of the environmental health risk situation for the selected city, styled as an insight box and scrollable for longer content. This feature aims to provide a nuanced analysis using generative AI as a tool.
- Interactive Q&A Section: Allows users to input free-form questions and receive a simulated AI-generated response, providing immediate, context-aware information about the environmental data. This acts as an interactive tool leveraging generative AI.

## Style Guidelines:

- Color scheme: A professional and clean light theme that provides optimal contrast for data visualization, especially the risk indicator colors.
- Primary color: A measured, mid-tone blue (#538CC6) selected to evoke professionalism and clarity, grounding the visual identity of the dashboard.
- Background color: A very subtle, off-white with a faint blue tint (#F6F7F8), ensuring a clean and unobtrusive canvas for data presentation.
- Accent color: A rich, deeper blue-purple (#452EB8) to provide strong contrast and highlight important interactive elements without competing with core data visualizations.
- Headline font: 'Space Grotesk' (sans-serif), lending a modern, techy feel suitable for an intelligence dashboard. Body text font: 'Inter' (sans-serif), chosen for its objective neutrality and excellent readability for presenting data and explanations.
- Use minimalistic, outline-style icons to maintain a clean, modern aesthetic that aligns with the dashboard's professional appearance.
- Embrace a card-based design with soft shadows and rounded corners to organize information. The layout should be responsive, adapting from a desktop grid to a stacked mobile arrangement.
- Implement subtle and smooth animations for value changes in the EHRI Risk Gauge and transitions in the Risk Breakdown bars to enhance user experience and engagement.