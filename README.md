# Kanban Board

A powerful, privacy-focused Kanban board application built with React. This application helps teams organize and track their work with a visual, card-based interface while maintaining complete data privacy by storing all information locally in the browser.

## Privacy & Security

- **100% Local Storage**: All data is stored exclusively in your browser's local storage
- **No Server Communication**: The application runs entirely in your browser with no external data transmission
- **Offline Capable**: Works without internet connection
- **Data Control**: Export and import boards as JSON files for backup and sharing
- **Privacy Compliant**: Suitable for projects with high security constraints as no data leaves your device

## Key Features

### Board Management

- Multiple boards for different projects or teams
- Real-time updates with automatic saving to browser storage
- Board export/import functionality for backup and sharing
- Board renaming and deletion capabilities

### Task Organization

- Drag-and-drop interface for intuitive task management
- Create, edit, and delete tasks with rich descriptions
- Set and track due dates with visual status indicators
- Mark tasks as complete with visual feedback
- Reorder tasks within and between columns

### Team Collaboration

- Add team members with auto-generated avatars
- Drag-and-drop team member assignment to tasks
- Multiple assignees per task
- Quick member removal from tasks

### Visual Management

- Customizable columns for workflow stages
- Column reordering via drag and drop
- Zoom control for better board overview
- Visual indicators for task status and deadlines

### Data Management

- Automatic saving to browser's localStorage
- JSON export for backup and sharing
- JSON import for board restoration
- No account required, instant setup

### Privacy Features

- No server-side storage
- No tracking or analytics
- Complete data ownership
- Suitable for sensitive projects

This tool is perfect for:

- Teams working on sensitive projects
- Organizations with strict data privacy requirements
- Individual project management
- Offline-first workflow management
- Quick setup without infrastructure requirements

## Installation & Running

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kanban-board.git
cd kanban-board
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Production Build

1. Create optimized production build:
```bash
npm run build
```

2. Preview production build locally:
```bash
npm run preview
```

### Docker Deployment

#### Quick Start

Use the provided build script:
```bash
chmod +x build.sh
./build.sh
```

#### Manual Docker Setup

1. Build the Docker image:
```bash
docker build -t kanban-board:latest .
```

2. Run the container:
```bash
docker run -d -p 8080:80 --name kanban-board kanban-board:latest
```

3. Access the application at [http://localhost:8080](http://localhost:8080)

#### Docker Management

Stop the container:
```bash
docker stop kanban-board
```

Remove the container:
```bash
docker rm kanban-board
```

Remove the image:
```bash
docker rmi kanban-board:latest
```

### Environment Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker (optional, for containerized deployment)

## Usage Guide

### Board Management

1. **Creating a New Board**:
   - Click the board selector dropdown
   - Choose "Create New Board"
   - Double-click the board name to rename it

2. **Importing/Exporting Boards**:
   - Click "Export Board" to save current board as JSON
   - Use "Open Board" to import a saved board file

### Column Management

1. **Adding Columns**:
   - Click "+ Add Column" in the top right
   - Double-click column header to rename
   - Drag columns to reorder them

2. **Deleting Columns**:
   - Click the "×" button in column header
   - Confirmation will be requested

### Task Management

1. **Creating Tasks**:
   - Click "+ Add Task" at bottom of column
   - Enter title (required) and description (optional)
   - Press Enter or click outside to save

2. **Editing Tasks**:
   - Double-click task to open editor
   - Modify title, description, or due date
   - Tasks can be marked as complete

3. **Moving Tasks**:
   - Drag tasks between columns
   - Reorder tasks within columns

### Team Management

1. **Adding Team Members**:
   - Use the team bar at bottom of screen
   - Click "+" to add new member
   - Initials are auto-generated

2. **Task Assignment**:
   - Drag team member avatar to task
   - Click member avatar on task to remove

3. **Member Management**:
   - Members are saved with the board
   - Export board to save team configuration

## Technical Details

Built with:
- React 18
- Vite
- react-beautiful-dnd for drag and drop
- styled-components for styling
- localStorage for persistence

## Browser Support

Supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b /NinoCoelho/rabbit-task`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- React Beautiful DnD for the drag and drop functionality
- Styled Components for the styling system
- Local Storage for the persistence layer
- Vite for the build system
- React for the UI framework
- Docker for the containerization
- Node.js for the runtime environment
- npm for the package manager
- git for the version control system
   