import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BoardSelector = styled.button`
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 300px;
  justify-content: space-between;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  &:after {
    content: '▼';
    font-size: 14px;
    opacity: 0.7;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 16px;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }
`;

const CreateBoardButton = styled(MenuItem)`
  color: #0052cc;
  font-weight: 500;
`;

const BoardSelectorInput = styled.input`
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid #0052cc;
  background: white;
  color: #444;
  font-size: 18px;
  font-weight: 600;
  min-width: 300px;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,82,204,0.2);
`;

const ImportButton = styled(MenuItem)`
  border-top: 1px solid #ddd;
  color: #0052cc;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const DeleteBoardButton = styled.span`
  color: #ff5252;
  opacity: 0;
  font-size: 18px;
  padding: 4px 8px;
  cursor: pointer;
  transition: opacity 0.2s;

  ${MenuItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 82, 82, 0.1);
    border-radius: 4px;
  }
`;

const BoardControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #f0f0f0;
    color: #000;
  }
`;

const MenuItemCurrent = styled(MenuItem)`
  background: #f0f7ff;
  border-left: 3px solid #0052cc;
  
  &:hover {
    background: #e6f0ff;
  }
`;

function BoardList({ 
  boards, 
  currentBoardId, 
  onBoardSelect, 
  onCreateBoard, 
  onUpdateTitle,
  onImportBoard,
  onDeleteBoard,
  onExportBoard,
  onPrintBoard,
  onShareBoard
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const currentBoard = boards.find(b => b.id === currentBoardId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditValue(currentBoard.title);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    onUpdateTitle(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
    e.stopPropagation();
  };

  const handleDeleteBoard = (e, boardId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      onDeleteBoard(boardId);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Check if a board with the exact same title exists
      const baseTitle = importedData.title;
      console.log('Original title:', baseTitle);
      const exactMatch = boards.some(board => board.title === baseTitle);
      
      if (exactMatch) {
        // Find boards with similar names and get the highest number
        const regex = new RegExp(`^${baseTitle}(?: \\((\\d+)\\))?$`);
        
        const existingNumbers = boards
          .map(board => {
            const match = board.title.match(regex);
            return match ? parseInt(match[1] || 1) : 0;
          })
          .filter(num => num > 0);

        // If there are similar boards, increment the highest number
        const highestNum = existingNumbers.length > 0 
          ? Math.max(...existingNumbers) 
          : 1;
        
        importedData.title = `${baseTitle} (${highestNum + 1})`;
        console.log('New title:', importedData.title);
      }

      console.log('Importing board with title:', importedData.title);
      onImportBoard(importedData);
    } catch (error) {
      console.error('Error importing board:', error);
      alert('Failed to import board. Please check the file format.');
    }
  };

  return (
    <Container>
      {isEditing ? (
        <BoardSelectorInput
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <BoardSelector 
          onClick={() => setIsOpen(!isOpen)}
          onDoubleClick={handleDoubleClick}
        >
          {currentBoard?.title || 'Select Board'}
        </BoardSelector>
      )}

      <BoardControls>
        <ToolbarButton onClick={onExportBoard} title="Export to JSON">
          💾 Export
        </ToolbarButton>
        <ToolbarButton onClick={onPrintBoard} title="Export to PDF">
          📄 PDF
        </ToolbarButton>
        <ToolbarButton onClick={onShareBoard} title="Share Board">
          🔗 Share
        </ToolbarButton>
      </BoardControls>

      {isOpen && (
        <DropdownMenu>
          {boards.map(board => {
            const isCurrentBoard = board.id === currentBoardId;
            const ItemComponent = isCurrentBoard ? MenuItemCurrent : MenuItem;
            
            return (
              <ItemComponent
                key={board.id}
                onClick={() => {
                  onBoardSelect(board.id);
                  setIsOpen(false);
                }}
              >
                {board.title}
                {boards.length > 1 && !isCurrentBoard && (
                  <DeleteBoardButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(e, board.id);
                    }}
                    title="Delete Board"
                  >
                    −
                  </DeleteBoardButton>
                )}
              </ItemComponent>
            );
          })}
          <CreateBoardButton
            onClick={() => {
              onCreateBoard();
              setIsOpen(false);
            }}
          >
            + Create New Board
          </CreateBoardButton>
          <ImportButton>
            <span>📂 Open Board</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              onClick={e => e.stopPropagation()}
            />
          </ImportButton>
        </DropdownMenu>
      )}
    </Container>
  );
}

export default BoardList; 