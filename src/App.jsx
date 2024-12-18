import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useBoard } from './hooks/useBoard';
import CommandBar from './components/CommandBar/CommandBar';
import BoardContainer from './components/BoardContainer/BoardContainer';
import TeamPanel from './components/TeamPanel/TeamPanel';
import AddMemberDialog from './components/AddMemberDialog';
import ImportDialog from './components/ImportDialog';
import { getBoardFromUrl } from './utils/urlUtils';
import { initialData } from './data/initialData';
import { createEmptyBoard } from './utils/boardUtils';
import FlowDiagram from './components/FlowDiagram/FlowDiagram';
import ErrorBoundary from './components/ErrorBoundary';
import BoardList from './components/BoardList';
import ZoomControl from './components/ZoomControl';

const Container = styled.div`
  height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid #e1e4e8;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

/**
 * Main application component that manages the kanban board and team collaboration features
 */
function App() {
  const {
    state,
    updateCurrentBoard,
    handleExportBoard,
    handleExportPDF,
    handleShare,
    handleImportBoard,
    createNewBoard,
    selectBoard,
    updateBoardTitle,
    deleteBoard,
    addNewColumn,
    updateColumnTitle,
    deleteColumn,
    addNewTask,
    updateTask,
    deleteTask,
    handleZoomChange,
    handleAddMember,
  } = useBoard(initialData);

  const [isTeamPanelExpanded, setIsTeamPanelExpanded] = useState(true);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [importDialogData, setImportDialogData] = useState(null);

  const currentBoard = state?.boards?.find(b => b.id === state.currentBoardId) || createEmptyBoard('board-1');

  const handleDragEnd = (result) => {
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

  // Handle URL-based board imports
  useEffect(() => {
    const boardFromUrl = getBoardFromUrl();
    if (boardFromUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const existingBoard = state.boards.find(b => b.title === boardFromUrl.title);
      if (existingBoard) {
        setImportDialogData(boardFromUrl);
      } else {
        handleImportBoard(boardFromUrl);
      }
    }
  }, []);

  // Handle routing
  const path = window.location.pathname;
  if (path === '/draw') {
    return <FlowDiagram />;
  }

  const handleAddMemberClick = () => {
    setIsAddMemberDialogOpen(true);
  };

  const handleAddMemberSubmit = (name) => {
    handleAddMember(name);
    setIsAddMemberDialogOpen(false);
  };

  const handleAddMemberClose = () => {
    setIsAddMemberDialogOpen(false);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ErrorBoundary>
        <Container>
          <Header>
            <BoardList
              boards={state.boards}
              currentBoardId={state.currentBoardId}
              onBoardCreate={createNewBoard}
              onBoardSelect={selectBoard}
              onBoardUpdate={updateBoardTitle}
              onDeleteBoard={deleteBoard}
              onExportBoard={handleExportBoard}
              onPrintBoard={handleExportPDF}
              onShareBoard={handleShare}
              onImportBoard={handleImportBoard}
            />
            <Controls>
              <ZoomControl
                zoom={currentBoard?.zoom || 1}
                onZoomChange={handleZoomChange}
              />
            </Controls>
          </Header>
          <MainContainer>
            <BoardContainer
              currentBoard={currentBoard}
              updateCurrentBoard={updateCurrentBoard}
              onColumnUpdate={updateColumnTitle}
              onColumnDelete={deleteColumn}
              onTaskAdd={addNewTask}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
            />

            <TeamPanel
              isExpanded={isTeamPanelExpanded}
              onToggleExpand={() => setIsTeamPanelExpanded(!isTeamPanelExpanded)}
              members={currentBoard.members}
              onAddMember={handleAddMemberClick}
            />
          </MainContainer>
        </Container>

        {/* Dialogs */}
        {isAddMemberDialogOpen && (
          <AddMemberDialog
            isOpen={isAddMemberDialogOpen}
            onClose={handleAddMemberClose}
            onAddMember={handleAddMemberSubmit}
          />
        )}

        {importDialogData && (
          <ImportDialog
            data={importDialogData}
            onClose={() => setImportDialogData(null)}
            onImport={(data, createNew) => {
              try {
                handleImportBoard(data, createNew);
                setImportDialogData(null);
              } catch (error) {
                console.error('Import failed:', error);
                alert('Failed to import board: ' + error.message);
              }
            }}
          />
        )}
      </ErrorBoundary>
    </DragDropContext>
  );
}

export default App;