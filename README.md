## Player Stats Application

This application is a full-stack web app for viewing, searching, and analyzing baseball player statistics.

### Features
- **Frontend:** React with Material React Table and Tailwind CSS for a modern, interactive UI.
- **Backend:** Django REST API serving player stats from a database.
- **Table:** Paginated, sortable, and filterable table of player stats.
- **AI Integration:** Each row has an "Ask AI" button that queries OpenAI (via the backend) for a summary of the selected player and their stats.
- **Live Data:** Backend can refresh player stats from an external API.

### Usage
1. Start the Django backend (`python manage.py runserver`).
2. Start the React frontend (`npm start`).
3. Browse, search, and sort player stats. Click "Ask AI" for an AI-generated summary of any player.

### Technologies
- React, TypeScript, Tailwind CSS
- Django, Django REST Framework
- OpenAI API
