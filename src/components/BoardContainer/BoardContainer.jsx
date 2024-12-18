import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Column from '../Column';

const Container = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  display: flex;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0;
  
  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
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

const ColumnsContainer = styled.div`
  display: flex;
  gap: ${props => 12 * props.$zoom}px;
  padding: ${props => 20 * props.$zoom}px;
  min-height: 100%;
  align-items: flex-start;
  transform-origin: top left;
  transform: scale(${props => props.$zoom || 1});
  width: fit-content;
  min-width: 100%;
`;

const ColumnWrapper = styled.div`
  flex-shrink: 0;
  width: ${props => 180 * props.$zoom}px;
  font-size: ${props => 11 * props.$zoom}px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

/**
 * BoardContainer component that renders the columns and their tasks
 */
const BoardContainer = ({
  currentBoard,
  updateCurrentBoard,
  onColumnUpdate,
  onColumnDelete,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete
}) => {
  return (
    <Container>
      <ScrollContainer>
        <ColumnsContainer 
          className="columns-container"
          $zoom={currentBoard.zoom}
        >
          {currentBoard.columnOrder.map((columnId) => {
            const column = currentBoard.columns[columnId];
            const tasks = column.taskIds.map(taskId => currentBoard.tasks[taskId]);
            
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                board={currentBoard}
                updateCurrentBoard={updateCurrentBoard}
                onUpdateTitle={onColumnUpdate}
                onDelete={onColumnDelete}
                onAddTask={onTaskAdd}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
              />
            );
          })}
        </ColumnsContainer>
      </ScrollContainer>
    </Container>
  );
};

export default BoardContainer; 