import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import Column from './components/Column';
import BoardTitle from './components/BoardTitle';
import BoardList from './components/BoardList';
import ErrorBoundary from './components/ErrorBoundary';
import ZoomControl from './components/ZoomControl';
import TeamBar from './components/TeamBar';

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
  transform-origin: top left;
  transform: scale(${props => props.zoom});
  width: ${props => `${100 / props.zoom}%`};
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

const FileInput = styled.input`
  display: none;
`;

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
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}.json`;
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ErrorBoundary>
        <Container>
          <CommandBar>
            <CommandBarLeft>
              <BoardList
                boards={state.boards}
                currentBoardId={state.currentBoardId}
                onBoardSelect={selectBoard}
                onCreateBoard={createNewBoard}
                onUpdateTitle={updateBoardTitle}
                onImportBoard={importData}
                onDeleteBoard={deleteBoard}
              />
              <ExportButton 
                onClick={handleExportBoard}
              >
                Export Board
              </ExportButton>
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
                  zoom={currentBoard.zoom || 1}
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
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
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
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ColumnsContainer>
              )}
            </Droppable>
          </BoardContainer>
          <TeamBar 
            members={currentBoard.members} 
            onAddMember={handleAddMember}
          />
        </Container>
      </ErrorBoundary>
    </DragDropContext>
  );
}

export default App; 