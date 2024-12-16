import React, { forwardRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChecklistDialog from './ChecklistDialog';

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  background: #f8f9fa;
`;

const Shape = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid ${props => props.$isSelected ? '#0052cc' : '#666'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 8px;
  
  ${props => props.$type === 'diamond' && `
    transform: rotate(45deg);
    width: ${props => props.width}px !important;
    height: ${props => props.width}px !important;
    padding: 0;
    & > span {
      transform: rotate(-45deg);
      width: 141%;
      height: 141%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
  
  ${props => props.$type === 'start' && `
    border-radius: 20px;
  `}
  
  ${props => props.$type === 'end' && `
    width: 30px !important;
    height: 30px !important;
    border-radius: 50%;
    border-width: 3px;
    padding: 0;
  `}
  
  ${props => props.$type === 'note' && `
    background: #fff9c4;
    border: 1px solid #ffd54f;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    min-height: 100px;
    padding: 12px;
    border-radius: 2px;
    font-family: 'Roboto', sans-serif;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      border-width: 0 16px 16px 0;
      border-style: solid;
      border-color: #ffd54f #fff;
    }
  `}
  
  ${props => props.$type === 'checklist' && `
    background: ${props.$progress === 'none' ? '#ffebee' : 
                props.$progress === 'partial' ? '#fff3e0' : 
                '#e8f5e9'};
    border: 1px solid ${props.$progress === 'none' ? '#ffcdd2' : 
                       props.$progress === 'partial' ? '#ffe0b2' : 
                       '#c8e6c9'};
    box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    min-height: 100px;
    padding: 12px;
    border-radius: 2px;
    font-family: 'Roboto', sans-serif;
    cursor: ${props => props.$isSelected ? 'move' : 'pointer'};
  `}
`;

const ShapeText = styled.span`
  font-size: ${props => props.$type === 'diamond' 
    ? `min(8px, ${props.width / 8}px)`
    : `min(10px, ${props.width / 12}px)`};
  color: #333;
  text-align: center;
  padding: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const ConnectionHandle = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: #0052cc;
  border: 2px solid white;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 2;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.2s;

  ${props => props.$type === 'diamond' ? `
    ${props.$position === 'top' && `
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
    `}
    ${props.$position === 'right' && `
      top: 50%;
      right: 0;
      transform: translate(50%, -50%) rotate(-45deg);
    `}
    ${props.$position === 'bottom' && `
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%) rotate(-45deg);
    `}
    ${props.$position === 'left' && `
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%) rotate(-45deg);
    `}
  ` : `
    ${props.$position === 'top' && `
      top: -5px;
      left: calc(50% - 5px);
    `}
    ${props.$position === 'right' && `
      right: -5px;
      top: calc(50% - 5px);
    `}
    ${props.$position === 'bottom' && `
      bottom: -5px;
      left: calc(50% - 5px);
    `}
    ${props.$position === 'left' && `
      left: -5px;
      top: calc(50% - 5px);
    `}
  `}
`;

const Connection = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
`;

const ConnectionLine = styled.path`
  fill: none;
  stroke: #666;
  stroke-width: 2;
  marker-end: url(#arrowhead);
  ${props => props.$isNoteConnection && `
    stroke-dasharray: 4;
  `}
`;

const TempConnectionLine = styled.line`
  stroke: #0052cc;
  stroke-width: 2;
  stroke-dasharray: 4;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #0052cc;
  border: 1px solid white;
  border-radius: 50%;
  z-index: 3;
  cursor: ${props => props.$cursor};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.2s;

  ${props => props.$position === 'nw' && `
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  `}
  ${props => props.$position === 'ne' && `
    top: -4px;
    right: -4px;
    cursor: ne-resize;
  `}
  ${props => props.$position === 'se' && `
    bottom: -4px;
    right: -4px;
    cursor: se-resize;
  `}
  ${props => props.$position === 'sw' && `
    bottom: -4px;
    left: -4px;
    cursor: sw-resize;
  `}
`;

const NoteContent = styled.div`
  width: 100%;
  height: 100%;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  font-size: 10px;

  span.bold {
    font-weight: bold;
  }

  span.italic {
    font-style: italic;
  }

  p {
    margin: 0;
    padding: 0;
  }

  p[data-bullet="true"] {
    padding-left: 12px;
    position: relative;

    &::before {
      content: "•";
      position: absolute;
      left: 2px;
    }
  }
`;

const CanvasTitle = styled.div`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #333;
  z-index: 1000;
  white-space: nowrap;
  padding: 8px 0;
  text-align: center;
  pointer-events: none;
`;

const ChecklistTitle = styled.div`
  position: absolute;
  top: -24px;
  left: 0;
  right: 0;
  font-weight: 600;
  font-size: 12px;
  color: ${props => 
    props.$progress === 'none' ? '#d32f2f' : 
    props.$progress === 'partial' ? '#ef6c00' : 
    '#2e7d32'};
  text-align: center;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 10px;
  line-height: 1.4;
  pointer-events: auto;

  input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
    pointer-events: auto;
  }

  span {
    pointer-events: none;
  }
`;

const ChecklistContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  pointer-events: auto;
`;

const FlowCanvas = forwardRef(({
  diagram,
  selectedShape,
  onSelectShape,
  onShapeMove,
  onTextEdit,
  isDrawingConnection,
  onCreateConnection,
  onDeleteShape,
  onAddShape,
  onDeleteConnection,
  title
}, ref) => {
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState(null);
  const [drawingConnection, setDrawingConnection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(null);
  const noteRefs = useRef({});
  const [checklistDialog, setChecklistDialog] = useState({ open: false, shape: null });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedShape) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!editingText && !checklistDialog.open) {
          e.preventDefault();
          onDeleteShape(selectedShape);
          onSelectShape(null);
        }
      }
      
      if (!editingText && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setEditingText(selectedShape);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape, editingText, checklistDialog.open, onDeleteShape, onSelectShape]);

  const handleMouseDown = (e, shape) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedShape(shape);
    onSelectShape(shape.id);
  };

  const handleMouseMove = (e) => {
    const container = ref.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggedShape) {
      onShapeMove(draggedShape.id, x - dragOffset.x, y - dragOffset.y);
    }

    if (resizing) {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      
      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;
      
      switch (resizing.position) {
        case 'se':
          newWidth = Math.max(30, resizing.startWidth + dx);
          newHeight = Math.max(30, resizing.startHeight + dy);
          break;
        case 'sw':
          newWidth = Math.max(30, resizing.startWidth - dx);
          newHeight = Math.max(30, resizing.startHeight + dy);
          break;
        case 'ne':
          newWidth = Math.max(30, resizing.startWidth + dx);
          newHeight = Math.max(30, resizing.startHeight - dy);
          break;
        case 'nw':
          newWidth = Math.max(30, resizing.startWidth - dx);
          newHeight = Math.max(30, resizing.startHeight - dy);
          break;
      }

      onShapeResize(resizing.shapeId, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setDraggedShape(null);
    setResizing(null);
    if (drawingConnection) {
      const targetShape = findShapeAtPosition(mousePos.x, mousePos.y);
      if (targetShape && targetShape.id !== drawingConnection.fromId) {
        onCreateConnection(drawingConnection.fromId, targetShape.id);
      }
      setDrawingConnection(null);
    }
  };

  const handleConnectionStart = (e, fromId, position) => {
    e.stopPropagation();
    setDrawingConnection({ fromId, position });
  };

  const findShapeAtPosition = (x, y) => {
    return diagram.shapes.find(shape => {
      const inX = x >= shape.x && x <= shape.x + shape.width;
      const inY = y >= shape.y && y <= shape.y + shape.height;
      return inX && inY;
    });
  };

  const calculateConnectionPath = (from, to, fromShape, toShape) => {
    let startX = from.x;
    let startY = from.y;
    let endX = to.x;
    let endY = to.y;

    if (toShape.type === 'end') {
      endX = toShape.x + 15;
      endY = toShape.y + 15;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const midX = startX + dx / 2;
    
    return `M ${startX} ${startY} 
            C ${midX} ${startY}, 
              ${midX} ${endY}, 
              ${endX} ${endY}`;
  };

  const handleDoubleClick = (shape) => {
    setEditingText(shape.id);
    setTimeout(() => {
      const input = document.querySelector(`input[data-shape-id="${shape.id}"]`);
      if (input) {
        input.select();
      }
    }, 0);
  };

  const handleResizeStart = (e, shape, position) => {
    e.stopPropagation();
    setResizing({
      shapeId: shape.id,
      position,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: shape.width,
      startHeight: shape.height
    });
  };

  const handleShapeDoubleClick = (e, shape) => {
    e.stopPropagation();
    if (shape.type === 'checklist') {
      setChecklistDialog({ 
        open: true, 
        shape
      });
    } else if (shape.type !== 'end') {
      setEditingText(shape.id);
      setTimeout(() => {
        const input = document.querySelector(`input[data-shape-id="${shape.id}"]`);
        if (input) {
          input.select();
        }
      }, 0);
    }
  };

  const handleCanvasClick = (e) => {
    onSelectShape(null);
    setEditingText(null);
  };

  const handleShapeClick = (e, shape) => {
    e.stopPropagation();
    onSelectShape(shape.id);
  };

  const handleNoteKeyDown = (e, shape) => {
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('bold', false);
    }
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('italic', false);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertParagraph', false);
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const newP = range.startContainer.parentElement;
      if (newP.previousSibling?.getAttribute('data-bullet') === 'true') {
        newP.setAttribute('data-bullet', 'true');
      }
    }
  };

  const handleNoteInput = (e, shape) => {
    const content = e.currentTarget;
    const paragraphs = content.getElementsByTagName('p');
    
    for (let p of paragraphs) {
      const text = p.textContent;
      if (text.startsWith('- ')) {
        p.setAttribute('data-bullet', 'true');
        p.textContent = text.substring(2);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'new-shape') {
        const canvasRect = ref.current.getBoundingClientRect();
        const scrollLeft = ref.current.scrollLeft;
        const scrollTop = ref.current.scrollTop;
        
        const x = e.clientX - canvasRect.left + scrollLeft;
        const y = e.clientY - canvasRect.top + scrollTop;
        
        if (data.shapeType === 'checklist') {
          setChecklistDialog({ 
            open: true, 
            shape: { x, y, isNew: true }
          });
        } else {
          onAddShape(data.shapeType, x, y);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleConnectionDoubleClick = (e, connectionId) => {
    e.stopPropagation();
    onDeleteConnection(connectionId);
  };

  const getChecklistProgress = (items) => {
    if (!items || items.length === 0) return 'none';
    const checkedCount = items.filter(item => item.checked).length;
    const percentage = (checkedCount / items.length) * 100;
    
    if (percentage === 0) return 'none';
    if (percentage < 100) return 'partial';
    return 'complete';
  };

  const handleCheckboxChange = (shapeId, itemIndex, checked) => {
    const shape = diagram.shapes.find(s => s.id === shapeId);
    if (!shape || !shape.items) return;

    const newItems = [...shape.items];
    newItems[itemIndex] = { ...newItems[itemIndex], checked };
    onTextEdit(shapeId, shape.text, newItems);
  };

  const handleChecklistSave = (title, items) => {
    if (checklistDialog.shape.isNew) {
      onAddShape('checklist', checklistDialog.shape.x, checklistDialog.shape.y, title, items);
    } else {
      onTextEdit(checklistDialog.shape.id, title, items);
    }
  };

  return (
    <CanvasContainer
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {title && <CanvasTitle>{title}</CanvasTitle>}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
        </marker>
      </defs>

      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        {diagram.connections.map(conn => {
          const fromShape = diagram.shapes.find(s => s.id === conn.from);
          const toShape = diagram.shapes.find(s => s.id === conn.to);
          if (!fromShape || !toShape) return null;

          const from = {
            x: fromShape.x + fromShape.width / 2,
            y: fromShape.y + fromShape.height / 2
          };
          const to = {
            x: toShape.x + toShape.width / 2,
            y: toShape.y + toShape.height / 2
          };

          // Check if either shape is a note
          const isNoteConnection = fromShape.type === 'note' || toShape.type === 'note';

          return (
            <ConnectionLine
              key={conn.id}
              d={calculateConnectionPath(from, to, fromShape, toShape)}
              onDoubleClick={(e) => handleConnectionDoubleClick(e, conn.id)}
              style={{ cursor: 'pointer' }}
              $isNoteConnection={isNoteConnection}
            />
          );
        })}
        {drawingConnection && (
          <TempConnectionLine
            x1={drawingConnection.x}
            y1={drawingConnection.y}
            x2={mousePos.x}
            y2={mousePos.y}
          />
        )}
      </svg>

      {diagram.shapes.map(shape => (
        <Shape
          key={shape.id}
          $type={shape.type}
          $isSelected={selectedShape === shape.id}
          $progress={shape.type === 'checklist' ? getChecklistProgress(shape.items) : undefined}
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.width,
            height: shape.type === 'diamond' ? shape.width : 
                   shape.type === 'end' ? 30 : 'auto'
          }}
          onClick={(e) => handleShapeClick(e, shape)}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, shape);
          }}
          onDoubleClick={(e) => handleShapeDoubleClick(e, shape)}
        >
          {shape.type === 'checklist' ? (
            <>
              <ChecklistTitle $progress={getChecklistProgress(shape.items)}>
                {shape.text}
              </ChecklistTitle>
              <ChecklistContent 
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
              >
                {shape.items?.map((item, index) => (
                  <ChecklistItem 
                    key={index}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(shape.id, index, e.target.checked);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <span>{item.text}</span>
                  </ChecklistItem>
                ))}
              </ChecklistContent>
            </>
          ) : shape.type === 'note' ? (
            <NoteContent
              ref={el => noteRefs.current[shape.id] = el}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={e => handleNoteKeyDown(e, shape)}
              onInput={e => handleNoteInput(e, shape)}
              onBlur={e => onTextEdit(shape.id, e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: shape.text }}
            />
          ) : shape.type !== 'end' && (
            editingText === shape.id ? (
              <input
                data-shape-id={shape.id}
                type="text"
                value={shape.text}
                onChange={(e) => onTextEdit(shape.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    setEditingText(null);
                  }
                  e.stopPropagation();
                }}
                autoFocus
                style={{ 
                  transform: shape.type === 'diamond' ? 'rotate(-45deg)' : 'none',
                  width: shape.type === 'diamond' ? '100%' : undefined,
                  fontSize: shape.type === 'diamond' ? '8px' : '10px'
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            ) : (
              <ShapeText 
                width={shape.width} 
                $type={shape.type}
              >
                {shape.text}
              </ShapeText>
            )
          )}
          {selectedShape === shape.id && (
            <>
              {['nw', 'ne', 'se', 'sw'].map(position => (
                <ResizeHandle
                  key={position}
                  $position={position}
                  $isVisible={true}
                  onMouseDown={(e) => handleResizeStart(e, shape, position)}
                />
              ))}
              {['top', 'right', 'bottom', 'left'].map(position => (
                <ConnectionHandle
                  key={position}
                  $position={position}
                  $type={shape.type}
                  $isVisible={true}
                  onMouseDown={(e) => handleConnectionStart(e, shape.id, position)}
                />
              ))}
            </>
          )}
        </Shape>
      ))}
      {checklistDialog.open && (
        <ChecklistDialog
          title={checklistDialog.shape.isNew ? '' : checklistDialog.shape.text}
          items={checklistDialog.shape.isNew ? [] : checklistDialog.shape.items}
          onSave={handleChecklistSave}
          onClose={() => setChecklistDialog({ open: false, shape: null })}
        />
      )}
    </CanvasContainer>
  );
});

export default FlowCanvas; 