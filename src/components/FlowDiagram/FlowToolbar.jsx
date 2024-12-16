import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  width: 60px;
  background: white;
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
`;

const ShapeButton = styled.div`
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  &:active {
    cursor: grabbing;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const FlowToolbar = () => {
  const handleDragStart = (e, shapeType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'new-shape',
      shapeType: shapeType
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <ToolbarContainer>
      <ShapeButton 
        draggable
        onDragStart={(e) => handleDragStart(e, 'rectangle')} 
        title="Rectangle"
      >
        <svg viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </ShapeButton>
      <ShapeButton 
        draggable
        onDragStart={(e) => handleDragStart(e, 'diamond')} 
        title="Diamond"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </ShapeButton>
      <ShapeButton 
        draggable
        onDragStart={(e) => handleDragStart(e, 'start')} 
        title="Start"
      >
        <svg viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </ShapeButton>
      <ShapeButton 
        draggable
        onDragStart={(e) => handleDragStart(e, 'end')} 
        title="End"
      >
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="3"/>
        </svg>
      </ShapeButton>
      <ShapeButton 
        draggable
        onDragStart={(e) => handleDragStart(e, 'note')} 
        title="Note"
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 3h18v18h-2l-2-2h-14v-16z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </ShapeButton>
    </ToolbarContainer>
  );
};

export default FlowToolbar; 