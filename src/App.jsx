import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import Column from './components/Column';
import BoardTitle from './components/BoardTitle';
import BoardList from './components/BoardList';
import ErrorBoundary from './components/ErrorBoundary';
import ZoomControl from './components/ZoomControl';
import TeamBar from './components/TeamBar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TeamMember from './components/TeamMember';
import AddMemberDialog from './components/AddMemberDialog';
import AppIcon from './components/AppIcon';
import { encodeBoard, getBoardFromUrl } from './utils/urlUtils';

const Container = styled.div`
  height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CommandBar = styled.div`
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  gap: 8px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
`;

const CommandBarLeft = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CommandBarRight = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  span {
    font-size: 16px;
    font-weight: bold;
  }
`;

const ExportButton = styled(ActionButton)`
  background: #0052cc;
  color: white;
  border-color: #0052cc;
  cursor: pointer;

  &:hover {
    background: #0047b3;
    border-color: #0047b3;
  }
`;

const BoardContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  display: flex;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 20px 20px 8px;
  flex: 1;
  overflow-x: auto;
  align-items: flex-start;
  height: 100%;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
`;

const ColumnWrapper = styled.div`
  flex-shrink: 0;
  width: ${props => 180 * props.$zoom}px;
  font-size: ${props => 11 * props.$zoom}px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FileInput = styled.input`
  display: none;
`;

const MainContainer = styled.div.attrs({ className: 'main-container' })`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const RightPanel = styled.div.attrs({ className: 'team-panel' })`
  width: ${props => props.$isExpanded ? '180px' : '40px'};
  background: white;
  border-left: 1px solid #e1e4e8;
  transition: width 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TeamPanelHeader = styled.div`
  padding: 8px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isExpanded ? 'space-between' : 'center'};
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TeamList = styled.div`
  padding: 4px;
  overflow-y: auto;
`;

const TeamMemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  border-radius: 4px;
  min-height: 28px;
  
  &:hover {
    background: #f8f9fa;
  }

  span {
    flex: 1;
    font-size: 12px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
`;

const AddMemberButton = styled(ActionButton)`
  margin: 4px;
  padding: 4px 8px;
  font-size: 12px;
  width: calc(100% - 8px);
  justify-content: center;

  span {
    font-size: 14px;
  }
`;

const IconButton = styled(ActionButton)`
  padding: 8px;
  
  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

const ExportIconButton = styled(IconButton)`
  background: #0052cc;
  color: white;
  border-color: #0052cc;

  &:hover {
    background: #0047b3;
    border-color: #0047b3;
  }
`;

const JsonIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.1 0-2-.9-2-2v-4c0-1.1-.9-2-2-2v-2c1.1 0 2-.9 2-2V5c0-1.1.9-2 2-2m14 0c1.1 0 2 .9 2 2v4c0 1.1.9 2 2 2v2c-1.1 0-2 .9-2 2v4c0 1.1-.9 2-2 2h-2v-2h2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5h-2V3h2M12 15c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1m5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3m4-3H17v1h1.5V13H17v2h-1.5V9h3v1.5m-6.5 0h1v3h-1v-3m-5 0h1v1H7v-1"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
  </svg>
);

const TopBarIcon = styled.div`
  height: 28px;  // Match the typical height of dropdown/buttons
  width: 28px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 100%;
    width: 100%;
  }
`;

const ShareButton = styled(ActionButton)`
  background: #0052cc;
  color: white;
  border-color: #0052cc;

  &:hover {
    background: #0047b3;
    border-color: #0047b3;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  &:hover {
    color: #c82333;
  }
`;

const DialogTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  padding-right: 32px;
`;

const DialogText = styled.p`
  margin: 8px 0;
  color: #666;
  font-size: 14px;
`;

const ImportDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  max-width: 400px;
  width: 90%;
`;

const ImportButton = styled(ActionButton)`
  padding: 6px 12px;
  font-size: 13px;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const createEmptyBoard = (id, title) => ({
  id,
  title: title || 'Untitled Board',
  tasks: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: [],
    }
  },
  columnOrder: ['column-1'],
  zoom: 1,
  members: [],
});

const initialData = {
  boards: [createEmptyBoard('board-1')],
  currentBoardId: 'board-1'
};

const generateInitials = (name) => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

function App() {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {
        console.error('Error parsing saved state:', error);
        return initialData;
      }
    }
    return initialData;
  });

  const currentBoard = state?.boards?.find(b => b.id === state.currentBoardId) || createEmptyBoard('board-1');

  useEffect(() => {
    try {
      localStorage.setItem('kanbanState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state]);

  const handleExportBoard = () => {
    try {
      const dataStr = JSON.stringify(currentBoard, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create formatted date string
      const now = new Date();
      const dateStr = now.toISOString()
        .replace(/[:.]/g, '-') // Replace colons and periods with hyphens
        .replace('T', '_')     // Replace T with underscore
        .slice(0, -5);         // Remove milliseconds and timezone
      
      // Create filename with board title and date
      const filename = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}_${dateStr}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting board:', error);
      alert('Failed to export the board. Please try again.');
    }
  };

  const updateCurrentBoard = (updater) => {
    setState(prevState => ({
      ...prevState,
      boards: prevState.boards.map(board => 
        board.id === prevState.currentBoardId
          ? updater(board)
          : board
      )
    }));
  };

  const createNewBoard = () => {
    const newBoardId = `board-${Date.now()}`;
    setState(prevState => ({
      boards: [...prevState.boards, createEmptyBoard(newBoardId)],
      currentBoardId: newBoardId
    }));
  };

  const selectBoard = (boardId) => {
    setState(prevState => ({
      ...prevState,
      currentBoardId: boardId
    }));
  };

  const updateBoardTitle = (newTitle) => {
    updateCurrentBoard(board => ({
      ...board,
      title: newTitle.trim() || 'Untitled Board'
    }));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Handle member assignment to tasks
    if (type === 'MEMBER') {
      const memberId = draggableId;
      const taskId = destination.droppableId;

      // Add member to task
      const task = currentBoard.tasks[taskId];
      if (!task.assignees?.includes(memberId)) {
        updateTask(taskId, {
          ...task,
          assignees: [...(task.assignees || []), memberId]
        });
      }
      return;
    }

    // Handle column reordering
    if (type === 'column') {
      const newColumnOrder = Array.from(currentBoard.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      updateCurrentBoard(board => ({
        ...board,
        columnOrder: newColumnOrder,
      }));
    }
  };

  const addNewColumn = () => {
    updateCurrentBoard(board => {
      const newColumnId = `column-${Object.keys(board.columns).length + 1}`;
      return {
        ...board,
        columns: {
          ...board.columns,
          [newColumnId]: {
            id: newColumnId,
            title: 'New Column',
            taskIds: [],
          },
        },
        columnOrder: [...board.columnOrder, newColumnId],
      };
    });
  };

  const updateColumnTitle = (columnId, newTitle) => {
    updateCurrentBoard(board => ({
      ...board,
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          title: newTitle,
        },
      },
    }));
  };

  const deleteColumn = (columnId) => {
    updateCurrentBoard(board => {
      const newState = {
        ...board,
        columnOrder: board.columnOrder.filter(id => id !== columnId),
        columns: { ...board.columns },
      };
      delete newState.columns[columnId];
      return newState;
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(currentBoard, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          // Validate the imported data structure
          if (
            importedData.tasks &&
            importedData.columns &&
            importedData.columnOrder
          ) {
            const newBoardId = `board-${Date.now()}`;
            const boardTitle = importedData.title || file.name.replace('.json', '');
            setState(prevState => ({
              ...prevState,
              boards: [...prevState.boards, { ...importedData, id: newBoardId, title: boardTitle }],
              currentBoardId: newBoardId
            }));
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const addNewTask = (columnId) => (taskData) => {
    if (!taskData || !taskData.title) {
      return;
    }
    const taskId = Date.now().toString();
    const newTask = {
      id: taskId,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      columnId: columnId
    };

    updateCurrentBoard(board => ({
      ...board,
      tasks: {
        ...board.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          taskIds: [...board.columns[columnId].taskIds, taskId],
        },
      },
    }));
  };

  const updateTask = (taskId, updates) => {
    if (!taskId || !updates) return;
    
    updateCurrentBoard(board => ({
      ...board,
      tasks: {
        ...board.tasks,
        [taskId]: {
          ...board.tasks[taskId],
          id: taskId,
          ...updates,
        },
      },
    }));
  };

  const deleteTask = (taskId, columnId) => {
    updateCurrentBoard(board => {
      const newState = {
        ...board,
        tasks: { ...board.tasks },
        columns: {
          ...board.columns,
          [columnId]: {
            ...board.columns[columnId],
            taskIds: board.columns[columnId].taskIds.filter(id => id !== taskId),
          },
        },
      };
      delete newState.tasks[taskId];
      return newState;
    });
  };

  const handleZoomChange = (newZoom) => {
    updateCurrentBoard(board => ({
      ...board,
      zoom: newZoom
    }));
  };

  const handleAddMember = (name) => {
    updateCurrentBoard(board => {
      const initials = generateInitials(name);
      // Check if initials already exist and modify if needed
      let finalInitials = initials;
      let counter = 1;
      while (board.members.some(m => m.initials === finalInitials)) {
        finalInitials = `${initials}${counter}`;
        counter++;
      }
  
      const newMember = {
        id: Date.now(),
        name,
        initials: finalInitials,
      };
  
      return {
        ...board,
        members: [...board.members, newMember],
      };
    });
  };

  const deleteBoard = (boardId) => {
    setState(prevState => {
      // Don't delete if it's the last board
      if (prevState.boards.length <= 1) {
        alert('Cannot delete the last board');
        return prevState;
      }
  
      const newBoards = prevState.boards.filter(board => board.id !== boardId);
      return {
        ...prevState,
        boards: newBoards,
        // If deleting current board, switch to the first available board
        currentBoardId: boardId === prevState.currentBoardId ? newBoards[0].id : prevState.currentBoardId
      };
    });
  };

  const handleExportPDF = async () => {
    try {
      const boardElement = document.querySelector('.columns-container');
      const teamPanel = document.querySelector('.team-panel');
      if (!boardElement) return;

      // Save current states
      const originalScrollLeft = boardElement.scrollLeft;
      const originalScrollTop = boardElement.scrollTop;
      const originalStyle = boardElement.style.cssText;
      const teamPanelOriginalStyle = teamPanel?.style.cssText;

      // Temporarily modify the containers
      boardElement.style.width = 'auto';
      boardElement.style.height = 'auto';
      boardElement.style.position = 'absolute';
      boardElement.style.overflow = 'visible';
      boardElement.style.paddingBottom = '20px';

      if (teamPanel) {
        teamPanel.style.position = 'absolute';
        teamPanel.style.right = '0';
        teamPanel.style.height = 'auto';
      }

      // Get the full dimensions including team panel
      const width = boardElement.scrollWidth + (teamPanel?.offsetWidth || 0);
      const height = Math.max(boardElement.scrollHeight, teamPanel?.scrollHeight || 0) + 200;

      // Create canvas from the entire board and team panel
      const canvas = await html2canvas(document.querySelector('.main-container'), {
        scale: 2,
        useCORS: true,
        logging: false,
        width: width,
        height: height + 20,
        windowWidth: width,
        windowHeight: height + 20,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedBoard = clonedDoc.querySelector('.columns-container');
          const clonedTeamPanel = clonedDoc.querySelector('.team-panel');
          
          if (clonedBoard) {
            clonedBoard.style.width = `${boardElement.scrollWidth}px`;
            clonedBoard.style.height = `${height}px`;
            clonedBoard.style.position = 'relative';
            clonedBoard.style.transform = 'none';
            clonedBoard.style.paddingBottom = '220px';
          }
          
          if (clonedTeamPanel) {
            clonedTeamPanel.style.position = 'absolute';
            clonedTeamPanel.style.right = '0';
            clonedTeamPanel.style.height = `${height}px`;
          }
        }
      });

      // Restore original styles
      boardElement.style.cssText = originalStyle;
      boardElement.scrollLeft = originalScrollLeft;
      boardElement.scrollTop = originalScrollTop;
      if (teamPanel) {
        teamPanel.style.cssText = teamPanelOriginalStyle;
      }

      // Create PDF with custom dimensions
      const pdfWidth = Math.min(297, width * 297 / height);
      const pdfHeight = height * pdfWidth / width;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      // Add the combined board and team panel image
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Add member summary below the board
      pdf.setFontSize(10);
      let yPos = pdfHeight + 10;

      // Add member summaries
      currentBoard.members.forEach(member => {
        const tasks = Object.values(currentBoard.tasks)
          .filter(task => task.assignees?.includes(member.id.toString()))
          .map(task => ({
            title: task.title,
            status: currentBoard.columns[task.columnId]?.title || 'Unknown'
          }));

        pdf.text(`${member.name} (${member.initials}):`, 10, yPos);
        yPos += 5;
        
        if (tasks.length === 0) {
          pdf.text('  No tasks assigned', 10, yPos);
          yPos += 5;
        } else {
          tasks.forEach(task => {
            pdf.text(`  • ${task.title} (${task.status})`, 10, yPos);
            yPos += 5;
          });
        }
        yPos += 2;
      });

      // Add unassigned tasks
      const unassignedTasks = Object.values(currentBoard.tasks)
        .filter(task => !task.assignees || task.assignees.length === 0)
        .map(task => ({
          title: task.title,
          status: currentBoard.columns[task.columnId]?.title || 'Unknown'
        }));

      pdf.text('Unassigned Tasks:', 10, yPos);
      yPos += 5;

      if (unassignedTasks.length === 0) {
        pdf.text('  No unassigned tasks', 10, yPos);
      } else {
        unassignedTasks.forEach(task => {
          pdf.text(`  • ${task.title} (${task.status})`, 10, yPos);
          yPos += 5;
        });
      }

      // Save with date and time
      const now = new Date();
      const dateTime = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);

      const filename = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}_${dateTime}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const [isTeamPanelExpanded, setIsTeamPanelExpanded] = useState(true);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [importDialogData, setImportDialogData] = useState(null);

  const handleShare = () => {
    const currentUrl = window.location.origin;
    const encodedBoard = encodeBoard(currentBoard);
    const shareUrl = `${currentUrl}?board=${encodedBoard}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy share link');
    });
  };

  const handleImportBoard = (board, createNew = false) => {
    const existingBoard = state.boards.find(b => b.title === board.title);
    
    if (existingBoard && !createNew) {
      // Override existing board
      const updatedBoards = state.boards.map(b => 
        b.id === existingBoard.id ? { ...board, id: existingBoard.id } : b
      );
      setState({ ...state, boards: updatedBoards, currentBoardId: existingBoard.id });
    } else {
      // Create new board with modified title if needed
      let newTitle = board.title;
      if (existingBoard) {
        const now = new Date().toISOString().replace(/[:.]/g, '-');
        newTitle = `${board.title} (Imported ${now})`;
      }
      const newBoard = { ...board, id: Date.now().toString(), title: newTitle };
      setState({
        ...state,
        boards: [...state.boards, newBoard],
        currentBoardId: newBoard.id
      });
    }
    setImportDialogData(null);
  };

  useEffect(() => {
    const boardFromUrl = getBoardFromUrl();
    if (boardFromUrl) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const existingBoard = state.boards.find(b => b.title === boardFromUrl.title);
      if (existingBoard) {
        setImportDialogData(boardFromUrl);
      } else {
        handleImportBoard(boardFromUrl);
      }
    }
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ErrorBoundary>
        <Container>
          <CommandBar>
            <CommandBarLeft>
              <TopBarIcon>
                <AppIcon />
              </TopBarIcon>
              <BoardList
                boards={state.boards}
                currentBoardId={state.currentBoardId}
                onBoardSelect={selectBoard}
                onCreateBoard={createNewBoard}
                onUpdateTitle={updateBoardTitle}
                onImportBoard={importData}
                onDeleteBoard={deleteBoard}
              />
              <ExportIconButton 
                onClick={handleExportBoard}
                title="Export as JSON"
              >
                <JsonIcon />
              </ExportIconButton>
              <ExportIconButton 
                onClick={handleExportPDF}
                title="Export as PDF"
              >
                <PdfIcon />
              </ExportIconButton>
              <ExportIconButton 
                onClick={handleShare}
                title="Share Board"
              >
                <ShareIcon />
              </ExportIconButton>
            </CommandBarLeft>
            <CommandBarRight>
              <ZoomControl 
                zoom={currentBoard.zoom || 1}
                onZoomChange={handleZoomChange}
              />
              <ActionButton onClick={addNewColumn}>
                <span>+</span> Add Column
              </ActionButton>
            </CommandBarRight>
          </CommandBar>
          
          <MainContainer>
            <BoardContainer>
              <Droppable
                droppableId="all-columns"
                direction="horizontal"
                type="column"
              >
                {(provided) => (
                  <ColumnsContainer
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="columns-container"
                  >
                    {currentBoard.columnOrder.map((columnId, index) => {
                      const column = currentBoard.columns[columnId];
                      const tasks = column.taskIds.map(
                        (taskId) => currentBoard.tasks[taskId] || { id: taskId, title: 'Missing Task', description: '' }
                      );

                      return (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <ColumnWrapper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                              $zoom={currentBoard.zoom || 1}
                            >
                              <Column
                                column={column}
                                tasks={tasks}
                                onUpdateTitle={updateColumnTitle}
                                onDelete={deleteColumn}
                                onAddTask={addNewTask(column.id)}
                                onUpdateTask={updateTask}
                                onDeleteTask={(taskId) => deleteTask(taskId, column.id)}
                                dragHandleProps={provided.dragHandleProps}
                                currentBoard={currentBoard}
                                updateCurrentBoard={updateCurrentBoard}
                              />
                            </ColumnWrapper>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ColumnsContainer>
                )}
              </Droppable>
            </BoardContainer>

            <RightPanel $isExpanded={isTeamPanelExpanded}>
              <TeamPanelHeader 
                $isExpanded={isTeamPanelExpanded}
                onClick={() => setIsTeamPanelExpanded(!isTeamPanelExpanded)}
              >
                {isTeamPanelExpanded ? (
                  <>
                    <span>Team Members</span>
                    <span>›</span>
                  </>
                ) : (
                  <span>‹</span>
                )}
              </TeamPanelHeader>
              
              {isTeamPanelExpanded && (
                <TeamList>
                  {currentBoard.members.map(member => (
                    <TeamMemberItem key={member.id}>
                      <TeamMember
                        member={{
                          ...member,
                          name: member.name.split(' ').map(part => 
                            part.length > 10 ? part.substring(0, 10) + '...' : part
                          ).join(' ')
                        }}
                        isTeamBar={true}
                        size="small"
                      />
                      <span>{member.name}</span>
                    </TeamMemberItem>
                  ))}
                  <AddMemberButton onClick={() => setIsAddMemberDialogOpen(true)}>
                    <span>+</span> Add Member
                  </AddMemberButton>
                </TeamList>
              )}
            </RightPanel>
          </MainContainer>
        </Container>

        {isAddMemberDialogOpen && (
          <AddMemberDialog
            onClose={() => setIsAddMemberDialogOpen(false)}
            onAddMember={(name) => {
              handleAddMember(name);
              setIsAddMemberDialogOpen(false);
            }}
          />
        )}

        {importDialogData && (
          <DialogOverlay>
            <ImportDialog>
              <CloseButton onClick={() => setImportDialogData(null)} title="Cancel">
                <CloseIcon />
              </CloseButton>
              <DialogTitle>Import Board</DialogTitle>
              <DialogText>A board named "{importDialogData.title}" already exists.</DialogText>
              <DialogText>Would you like to:</DialogText>
              <ButtonGroup>
                <ImportButton onClick={() => handleImportBoard(importDialogData, true)}>
                  Create New Version
                </ImportButton>
                <ImportButton onClick={() => handleImportBoard(importDialogData, false)}>
                  Override Existing
                </ImportButton>
              </ButtonGroup>
            </ImportDialog>
          </DialogOverlay>
        )}
      </ErrorBoundary>
    </DragDropContext>
  );
}

export default App; 