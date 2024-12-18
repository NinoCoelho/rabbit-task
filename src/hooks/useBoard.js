import { useState, useEffect, useCallback } from 'react';
import { createEmptyBoard } from '../utils/boardUtils';
import { STORAGE_KEYS } from '../constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { encodeBoard } from '../utils/urlUtils';

export const useBoard = (initialData) => {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEYS.KANBAN_STATE);
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KANBAN_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state]);

  const updateCurrentBoard = useCallback((updater) => {
    setState(prevState => ({
      ...prevState,
      boards: prevState.boards.map(board => 
        board.id === prevState.currentBoardId
          ? (typeof updater === 'function' ? updater(board) : updater)
          : board
      )
    }));
  }, []);

  const createNewBoard = () => {
    const newBoardId = `board-${Date.now()}`;
    setState(prevState => ({
      ...prevState,
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

  const deleteBoard = (boardId) => {
    setState(prevState => {
      if (prevState.boards.length <= 1) {
        alert('Cannot delete the last board');
        return prevState;
      }
  
      const newBoards = prevState.boards.filter(board => board.id !== boardId);
      return {
        ...prevState,
        boards: newBoards,
        currentBoardId: boardId === prevState.currentBoardId ? newBoards[0].id : prevState.currentBoardId
      };
    });
  };

  const handleExportBoard = () => {
    try {
      const currentBoard = state.boards.find(b => b.id === state.currentBoardId);
      const exportData = {
        board: currentBoard,
        taskDiagrams: {}
      };

      // Get all task diagrams
      currentBoard.columnOrder.forEach(columnId => {
        const column = currentBoard.columns[columnId];
        column.taskIds.forEach(taskId => {
          const task = currentBoard.tasks[taskId];
          if (task.diagramId) {
            const savedDiagram = localStorage.getItem(`taskDiagram_${task.id}`);
            if (savedDiagram) {
              exportData.taskDiagrams[task.id] = JSON.parse(savedDiagram);
            }
          }
        });
      });

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const dateStr = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);
      
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

  const handleExportPDF = async () => {
    try {
      const boardElement = document.querySelector('.columns-container');
      const teamPanel = document.querySelector('.team-panel');
      if (!boardElement) {
        throw new Error('Board element not found');
      }

      // Save current states
      const originalScrollLeft = boardElement.scrollLeft;
      const originalScrollTop = boardElement.scrollTop;
      const originalStyle = boardElement.style.cssText;
      const teamPanelOriginalStyle = teamPanel?.style.cssText;

      // Create a wrapper div for padding
      const wrapper = document.createElement('div');
      wrapper.style.padding = '0 0 100px 0'; // Add 100px padding at bottom
      wrapper.style.background = '#f5f6f8';
      
      // Clone the board element into the wrapper
      const boardClone = boardElement.cloneNode(true);
      wrapper.appendChild(boardClone);
      document.body.appendChild(wrapper);

      // Modify for export
      boardClone.style.overflow = 'visible';
      boardClone.style.width = 'auto';
      boardClone.style.height = 'auto';
      boardClone.style.transform = 'none';
      if (teamPanel) {
        teamPanel.style.display = 'none';
      }

      // Calculate dimensions including padding
      const wrapperRect = wrapper.getBoundingClientRect();
      const scale = 2; // Increase quality

      // Create canvas with higher quality
      const canvas = await html2canvas(wrapper, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#f5f6f8',
        width: wrapperRect.width,
        height: wrapperRect.height
      });

      // Remove the temporary wrapper
      document.body.removeChild(wrapper);

      // Create PDF in landscape with custom size
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const aspectRatio = imgWidth / imgHeight;
      
      // Use A4 width as base and calculate height to maintain aspect ratio
      const a4Width = 297; // A4 width in mm
      const a4Height = a4Width / aspectRatio;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [a4Height, a4Width]
      });

      // Add board title
      const currentBoard = state.boards.find(b => b.id === state.currentBoardId);
      pdf.setFontSize(16);
      pdf.text(currentBoard.title, 15, 15);

      // Add image to fill the page width
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        15, // left margin
        25, // top margin (after title)
        a4Width - 30, // width minus margins
        (a4Width - 30) / aspectRatio // height maintaining aspect ratio
      );

      // Generate filename and save
      const now = new Date();
      const dateStr = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);
      const filename = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}_${dateStr}.pdf`;

      pdf.save(filename);

      // Restore original styles
      boardElement.style.cssText = originalStyle;
      boardElement.scrollLeft = originalScrollLeft;
      boardElement.scrollTop = originalScrollTop;
      if (teamPanel) {
        teamPanel.style.cssText = teamPanelOriginalStyle;
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleShare = () => {
    try {
      const currentBoard = state.boards.find(b => b.id === state.currentBoardId);
      const exportData = {
        board: currentBoard,
        taskDiagrams: {}
      };

      // Get task diagrams
      currentBoard.columnOrder.forEach(columnId => {
        const column = currentBoard.columns[columnId];
        column.taskIds.forEach(taskId => {
          const task = currentBoard.tasks[taskId];
          if (task.diagramId) {
            const savedDiagram = localStorage.getItem(`taskDiagram_${task.id}`);
            if (savedDiagram) {
              exportData.taskDiagrams[task.id] = JSON.parse(savedDiagram);
            }
          }
        });
      });

      const currentUrl = window.location.origin;
      const encodedData = encodeBoard(exportData);
      const shareUrl = `${currentUrl}?board=${encodedData}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy share link');
      });
    } catch (error) {
      console.error('Error sharing board:', error);
      alert('Failed to create share link');
    }
  };

  const handleImportBoard = (importedData, createNew = false) => {
    try {
      // Validate imported data
      if (!importedData?.board) {
        throw new Error('Invalid board data: Missing board structure');
      }

      const boardData = importedData.board;
      const taskDiagrams = importedData.taskDiagrams || {};

      // Validate required board properties
      const requiredProperties = ['id', 'title', 'columns', 'tasks', 'columnOrder', 'members'];
      for (const prop of requiredProperties) {
        if (!boardData[prop]) {
          throw new Error(`Invalid board data: Missing ${prop}`);
        }
      }

      // Save task diagrams
      Object.entries(taskDiagrams).forEach(([taskId, diagram]) => {
        if (diagram) {
          try {
            localStorage.setItem(`taskDiagram_${taskId}`, JSON.stringify(diagram));
          } catch (error) {
            console.warn(`Failed to save diagram for task ${taskId}:`, error);
          }
        }
      });

      if (createNew) {
        // Create new board with unique ID
        const newBoardId = `board-${Date.now()}`;
        const newBoard = {
          ...boardData,
          id: newBoardId,
          title: `${boardData.title} (Copy)`
        };

        setState(prevState => ({
          ...prevState,
          boards: [...prevState.boards, newBoard],
          currentBoardId: newBoardId
        }));
      } else {
        // Add as new board with original ID
        setState(prevState => ({
          ...prevState,
          boards: [...prevState.boards, boardData],
          currentBoardId: boardData.id
        }));
      }
    } catch (error) {
      console.error('Error importing board:', error);
      throw new Error(`Failed to import board: ${error.message}`);
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

  const addNewTask = (columnId) => (taskData) => {
    if (!taskData || !taskData.title) return;
    
    const taskId = Date.now().toString();
    const newTask = {
      id: taskId,
      title: taskData.title,
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
          taskIds: taskData.addToTop 
            ? [taskId, ...board.columns[columnId].taskIds]
            : [...board.columns[columnId].taskIds, taskId],
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
      zoom: parseFloat(newZoom)
    }));
  };

  const handleAddMember = (name) => {
    updateCurrentBoard(board => {
      const initials = name.split(' ').map(part => part[0]).join('').toUpperCase();
      const newMember = {
        id: Date.now(),
        name,
        initials,
      };
      return {
        ...board,
        members: [...board.members, newMember],
      };
    });
  };

  return {
    state,
    updateCurrentBoard,
    createNewBoard,
    selectBoard,
    updateBoardTitle,
    deleteBoard,
    handleExportBoard,
    handleExportPDF,
    handleShare,
    handleImportBoard,
    addNewColumn,
    updateColumnTitle,
    deleteColumn,
    addNewTask,
    updateTask,
    deleteTask,
    handleZoomChange,
    handleAddMember,
  };
}; 