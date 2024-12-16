import React, { useState } from 'react';
import styled from 'styled-components';
import TaskDialog from './TaskDialog';
import TeamMember from './TeamMember';
import { MEMBER_COLORS } from '../constants';
import { FlowIcon } from './Icons';

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  margin-bottom: 6px;
  background: ${props => (props.$isDragging ? '#fff7b1' : '#fff9c4')};
  box-shadow: ${props => (props.$isDragging ? '0px 5px 10px rgba(0,0,0,0.15)' : '2px 2px 5px rgba(0,0,0,0.1)')};
  cursor: move;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  max-width: 100%;
  word-break: break-word;

  &:hover {
    box-shadow: 0px 3px 7px rgba(0,0,0,0.12);
  }
`;

const TitleBar = styled.div`
  padding: 6px 8px;
  background: #fff59d;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  font-weight: 600;
  font-size: 1em;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 12px;
  height: 12px;
  margin: 0;
  cursor: pointer;
`;

const TaskTitleText = styled.span`
  color: #2c3e50;
`;

const Content = styled.div`
  padding: 8px;
  font-size: 0.9em;
  color: #666;
  line-height: 1.4;
  white-space: pre-wrap;
  min-height: 20px;
  max-height: 200px;
  overflow-y: auto;
  opacity: ${props => props.$isDone ? 0.7 : 1};
  padding-bottom: ${props => props.$hasDueDate ? '24px' : '8px'};
`;

const StatusBar = styled.div`
  height: 4px;
  background: ${props => props.$color};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  margin-top: auto;
`;

const DueDate = styled.div`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 0.8em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 1;
`;

const AssigneeList = styled.div`
  display: flex;
  gap: 2px;
  padding: 4px;
  flex-wrap: wrap;
  min-height: 16px;
`;

const AssigneeMember = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 8px;
  cursor: pointer;
  position: relative;
  
  &::before {
    content: '−';
    position: absolute;
    width: 100%;
    height: 100%;
    background: #ff5252;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover {
    &::before {
      opacity: 1;
    }
  }
`;

const DropZone = styled.div`
  min-height: 40px;
  background: ${props => props.$isDragOver ? 'rgba(0,0,0,0.05)' : 'transparent'};
  border-radius: 4px;
  transition: all 0.2s;
  padding: 4px;
`;

const TaskMember = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color || '#ddd'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  margin-left: -6px;
  border: 1px solid white;
`;

const TaskCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  margin-bottom: 6px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TaskCardTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.95em;
`;

const TaskDescription = styled.div`
  color: #666;
  font-size: 0.85em;
  margin-bottom: 4px;
`;

const DiagramIndicator = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;

  svg {
    width: 14px;
    height: 14px;
    color: #666;
  }

  &:hover svg {
    color: #0052cc;
  }
`;

function Task({ 
  task, 
  index, 
  onUpdate, 
  onDelete, 
  currentBoard,
  column
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatTimeDiff = (date1, date2) => {
    const diff = Math.abs(date1 - date2);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const handleDoubleClick = (e) => {
    if (e.target.type === 'checkbox') return;
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onUpdate(task.id, { 
      ...task, 
      done: e.target.checked,
      completedAt: e.target.checked ? new Date().toISOString() : null 
    });
  };

  const formatDueDate = (date) => {
    if (task.done) {
      const completedDate = new Date(task.completedAt);
      const dueDate = new Date(date);
      if (completedDate > dueDate) {
        return 'Completed late';
      }
      return 'Completed on time';
    }
    
    const d = new Date(date);
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d overdue`;
    }
    
    if (diffDays === 0) {
      // Calculate hours remaining
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours <= 0) {
        return 'Due now';
      }
      return `${diffHours}h remaining`;
    }
    
    return `Due in ${diffDays}d`;
  };

  const getDueStatus = () => {
    if (!task.dueDate) return null;
    
    if (task.done) {
      const completedDate = new Date(task.completedAt);
      const dueDate = new Date(task.dueDate);
      
      if (completedDate > dueDate) {
        return { 
          color: '#ff5252', // Red for late completion
          text: `Completed ${formatTimeDiff(completedDate, dueDate)} late`
        };
      }
      return { 
        color: '#4caf50', // Green for on-time completion
        text: 'Completed on time'
      };
    }
    
    const now = new Date();
    const due = new Date(task.dueDate);
    
    if (due < now) {
      return { color: '#ff5252', text: 'Overdue' }; // Red
    }
    
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue <= 24) {
      return { color: '#ffd740', text: 'Due soon' }; // Yellow
    }
    
    return { color: '#4caf50', text: 'On track' }; // Green
  };
  
  const status = task.dueDate ? getDueStatus() : null;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task.id,
      sourceColumnId: task.columnId || column.id,
      sourceIndex: index
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    const data = e.dataTransfer.types.find(t => t === 'application/json');
    if (data) {
      e.preventDefault();
      e.currentTarget.style.backgroundColor = '#f8f9fa';
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'team-member') {
        const member = data.member;
        if (!task.assignees?.includes(member.id.toString())) {
          onUpdate(task.id, {
            ...task,
            assignees: [...(task.assignees || []), member.id.toString()]
          });
        }
      }
    } catch (err) {
      console.error('Error handling member drop:', err);
    }
  };

  const handleDiagramClick = (e) => {
    e.stopPropagation();
    
    // Create new diagram if none exists
    if (!task.diagramId) {
      const diagramId = `diagram-${Date.now()}`;
      const newDiagram = {
        id: diagramId,
        title: 'Task Diagram',
        shapes: [
          {
            id: 'shape-1',
            type: 'start',
            x: 100,
            y: 100,
            width: 120,
            height: 60,
            text: 'Start',
            connections: []
          }
        ],
        connections: []
      };

      // Save the new diagram
      localStorage.setItem(`taskDiagram_${task.id}`, JSON.stringify(newDiagram));

      // Update task with new diagram ID
      onUpdate(task.id, {
        ...task,
        diagramId
      });

      // Navigate to the diagram
      window.location.href = `/draw?taskId=${task.id}&diagramId=${diagramId}`;
    } else {
      // Open existing diagram
      window.location.href = `/draw?taskId=${task.id}&diagramId=${task.diagramId}`;
    }
  };

  const handleUpdate = (taskId, updates) => {
    onUpdate(taskId, updates);
    // If there's a diagramId in the updates, let the update complete before any navigation
    if (updates.diagramId) {
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      });
    }
  };

  return (
    <>
      <Container
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDragging={isDragging}
        onDoubleClick={handleDoubleClick}
      >
        <TitleBar>
          <TaskTitleText>{task.title}</TaskTitleText>
        </TitleBar>
        {task.description && (
          <Content $isDone={task.done} $hasDueDate={!!task.dueDate}>
            {task.description}
          </Content>
        )}
        <AssigneeList>
          <DiagramIndicator 
            onClick={handleDiagramClick}
            title={task.diagramId ? "Open diagram" : "Create diagram"}
          >
            <FlowIcon />
          </DiagramIndicator>
          {task.assignees?.map((memberId, index) => {
            const member = currentBoard.members.find(m => m.id.toString() === memberId);
            return member ? (
              <AssigneeMember
                key={member.id}
                $color={MEMBER_COLORS[member.id % MEMBER_COLORS.length]}
                title={`Remove ${member.name}`}
                onClick={() => {
                  onUpdate(task.id, {
                    ...task,
                    assignees: task.assignees.filter(id => id !== member.id.toString())
                  });
                }}
              >
                {member.initials}
              </AssigneeMember>
            ) : null;
          })}
        </AssigneeList>
        {status && (
          <>
            <StatusBar $color={status.color} title={status.text} />
            <DueDate>
              {formatDueDate(task.dueDate)}
              {task.dueDate && (
                <Checkbox
                  checked={task.done || false}
                  onChange={handleCheckboxChange}
                  onClick={e => e.stopPropagation()}
                />
              )}
            </DueDate>
          </>
        )}
      </Container>

      {isDialogOpen && (
        <TaskDialog
          task={task}
          onClose={() => setIsDialogOpen(false)}
          onUpdate={handleUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

export default Task; 