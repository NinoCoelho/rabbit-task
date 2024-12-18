import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Task from './Task';
import TaskDialog from './TaskDialog';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  height: fit-content;
  background: white;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: white;
  border-bottom: 1px solid #e1e4e8;
`;

const Title = styled.div`
  font-weight: bold;
  flex-grow: 1;
  font-size: 1.1em;
`;

const TitleInput = styled.input`
  font-size: 1.1em;
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
  font-size: 1.2em;
  
  &:hover {
    color: #666;
  }
`;

const TaskList = styled.div`
  padding: 8px;
  flex-grow: 1;
  min-height: 100px;
  
  overflow-y: visible;
  
  &::-webkit-scrollbar {
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

const TaskContainer = styled.div`
  position: relative;
`;

const AddTaskButton = styled.button`
  width: calc(100% - 16px);
  border: none;
  padding: 4px;
  background: #f1f3f5;
  color: #666;
  cursor: pointer;
  font-size: 8px;
  border-radius: 3px;
  margin: 4px 8px;

  &:hover {
    background: #e9ecef;
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
  font-size: 1.1em;
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
  font-size: 0.9em;
  min-height: 60px;
  resize: none;
  background: #fff9c4;
  color: #666;

  &:focus {
    outline: none;
    background: #fffde7;
  }
`;

const NewTaskDueDate = styled.input.attrs({ type: 'datetime-local' })`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: #fff9c4;
  color: #666;
  font-size: 0.9em;
  border-top: 1px solid rgba(0,0,0,0.05);

  &:focus {
    outline: none;
    background: #fffde7;
  }
`;

function Column({ 
  column, 
  tasks, 
  board, 
  onUpdateTitle, 
  onDelete, 
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  dragHandleProps,
  updateCurrentBoard,
  onTaskUpdate,
  onTaskDelete
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
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
    setNewTaskDueDate('');
  };

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (!onAddTask || !newTaskTitle.trim()) return;

    onAddTask(column.id)({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      dueDate: newTaskDueDate || null,
      addToTop: true
    });
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
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
    setNewTaskDueDate('');
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
      
      if (sourceColumnId === column.id) {
        // Reordering within the same column
        const dropTarget = e.target.closest('[data-task-index]');
        const targetIndex = dropTarget ? parseInt(dropTarget.dataset.taskIndex) : tasks.length;
        
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
        // Moving to a different column
        const task = board.tasks[taskId];
        if (!task) return;

        if (!board.columns[sourceColumnId] || !board.columns[column.id]) {
          console.error('Invalid column IDs');
          return;
        }

        const sourceColumn = board.columns[sourceColumnId];
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
      
      <AddTaskButton onClick={handleAddTask}>+ Add Task</AddTaskButton>

      <TaskList
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDraggingOver={false}
      >
        {isAddingTask && (
          <NewTaskForm onSubmit={handleNewTaskSubmit} onBlur={handleNewTaskBlur}>
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
            <NewTaskDueDate
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              placeholder="Set due date (optional)"
            />
          </NewTaskForm>
        )}
        {tasks.map((task, index) => (
          <TaskContainer key={task.id} data-task-index={index}>
            <Task 
              key={task.id} 
              task={task} 
              index={index}
              onTaskUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              currentBoard={board}
              column={column}
              board={board}
            />
          </TaskContainer>
        ))}
      </TaskList>
    </Container>
  );
}

export default Column; 