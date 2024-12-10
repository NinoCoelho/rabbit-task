import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Task from './Task';
import TaskDialog from './TaskDialog';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  min-width: 200px;
  max-width: 280px;
  height: fit-content;
  background: white;
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #f4f5f7;
`;

const Title = styled.div`
  font-weight: bold;
  flex-grow: 1;
`;

const TitleInput = styled.input`
  font-size: inherit;
  font-weight: bold;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 4px;
  flex-grow: 1;
  margin-right: 8px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  
  &:hover {
    color: #666;
  }
`;

const TaskList = styled.div`
  padding: 6px;
  flex-grow: 1;
  min-height: 100px;
  overflow-y: auto;
  background: ${props => (props.$isDraggingOver ? '#e9ecef' : 'white')};
  gap: 6px;
`;

const TaskContainer = styled.div`
  position: relative;
`;

const AddTaskButton = styled.button`
  width: 100%;
  padding: 6px;
  background: none;
  border: 2px dashed #ddd;
  border-radius: 3px;
  color: #666;
  cursor: pointer;
  margin-top: 6px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }
`;

const NewTaskForm = styled.form`
  margin-bottom: 8px;
  border-radius: 2px;
  background: #fff9c4;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
`;

const NewTaskInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: #fff59d;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;

  &:focus {
    outline: none;
    background: white;
    border-bottom-color: rgba(0,0,0,0.2);
  }
`;

const NewTaskTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: none;
  font-size: 13px;
  min-height: 60px;
  resize: none;
  background: #fff9c4;
  color: #666;

  &:focus {
    outline: none;
    background: #fffde7;
  }
`;

function Column({ 
  column, 
  tasks, 
  onUpdateTitle, 
  onDelete, 
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  dragHandleProps,
  currentBoard,
  updateCurrentBoard
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const inputRef = useRef(null);
  const newTaskInputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isAddingTask && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [isAddingTask]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (title.trim()) {
      onUpdateTitle(column.id, title);
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    }
    if (e.key === 'Escape') {
      setTitle(column.title);
      setIsEditing(false);
    }
  };

  const handleAddTask = () => {
    setIsAddingTask(true);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim()
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    }
  };

  const handleNewTaskBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (newTaskTitle.trim()) {
        handleNewTaskSubmit(e);
      } else {
        handleNewTaskCancel();
      }
    }
  };

  const handleNewTaskCancel = () => {
    setIsAddingTask(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#e9ecef';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'white';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'white';
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      
      const { taskId, sourceColumnId, sourceIndex } = JSON.parse(data);
      if (!taskId || !sourceColumnId) return;
      
      const dropTarget = e.target.closest('[data-task-index]');
      const targetIndex = dropTarget ? parseInt(dropTarget.dataset.taskIndex) : tasks.length;
      
      if (sourceColumnId === column.id) {
        const newTaskIds = Array.from(column.taskIds);
        newTaskIds.splice(sourceIndex, 1);
        newTaskIds.splice(targetIndex, 0, taskId);
        
        updateCurrentBoard(board => ({
          ...board,
          columns: {
            ...board.columns,
            [column.id]: {
              ...column,
              taskIds: newTaskIds
            }
          }
        }));
      } else {
        const task = currentBoard.tasks[taskId];
        if (!task) return;

        if (!currentBoard.columns[sourceColumnId] || !currentBoard.columns[column.id]) {
          console.error('Invalid column IDs');
          return;
        }

        const sourceColumn = currentBoard.columns[sourceColumnId];
        const sourceTaskIds = sourceColumn.taskIds || [];
        const targetTaskIds = column.taskIds || [];

        const newSourceTaskIds = sourceTaskIds.filter(id => id !== taskId);
        const newTargetTaskIds = [...targetTaskIds, taskId];

        updateCurrentBoard(board => ({
          ...board,
          tasks: {
            ...board.tasks,
            [taskId]: {
              ...task,
              columnId: column.id
            }
          },
          columns: {
            ...board.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              taskIds: newSourceTaskIds
            },
            [column.id]: {
              ...column,
              taskIds: newTargetTaskIds
            }
          }
        }));
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    }
  };

  return (
    <Container>
      <TitleContainer {...dragHandleProps}>
        {isEditing ? (
          <TitleInput
            ref={inputRef}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <Title onClick={handleTitleClick}>{column.title}</Title>
        )}
        <DeleteButton onClick={() => onDelete(column.id)}>×</DeleteButton>
      </TitleContainer>
      <TaskList
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDraggingOver={false}
      >
        {tasks.map((task, index) => (
          <TaskContainer key={task.id} data-task-index={index}>
            <Task 
              key={task.id} 
              task={task} 
              index={index}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              currentBoard={currentBoard}
              column={column}
            />
          </TaskContainer>
        ))}
        {isAddingTask ? (
          <NewTaskForm 
            onSubmit={handleNewTaskSubmit}
            onBlur={handleNewTaskBlur}
          >
            <NewTaskInput
              ref={newTaskInputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleNewTaskCancel();
                if (e.key === 'Enter' && newTaskTitle.trim()) {
                  handleNewTaskSubmit(e);
                }
              }}
            />
            <NewTaskTextarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description... (optional)"
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleNewTaskCancel();
                if (e.key === 'Enter' && !e.shiftKey && newTaskTitle.trim()) {
                  handleNewTaskSubmit(e);
                }
              }}
            />
          </NewTaskForm>
        ) : (
          <AddTaskButton onClick={handleAddTask}>
            + Add Task
          </AddTaskButton>
        )}
      </TaskList>
    </Container>
  );
}

export default Column; 