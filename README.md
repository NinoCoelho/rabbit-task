
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
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- React Beautiful DnD for the drag and drop functionality
- Styled Components for the styling system