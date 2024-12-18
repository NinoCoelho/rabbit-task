import React from 'react';
import styled from 'styled-components';
import { JsonIcon, PdfIcon, ShareIcon } from '../Icons';
import BoardList from '../BoardList';
import ZoomControl from '../ZoomControl';
import AppIcon from '../AppIcon';

const Container = styled.div`
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

const TopBarIcon = styled.div`
  height: 28px;
  width: 28px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 100%;
    width: 100%;
  }
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

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }
`;

const ExportIconButton = styled(ActionButton)`
  padding: 8px;
  
  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  background: #0052cc;
  color: white;
  border-color: #0052cc;

  &:hover {
    background: #0047b3;
    border-color: #0047b3;
  }
`;

const CommandBar = ({ 
  boards,
  currentBoardId,
  onBoardSelect,
  onCreateBoard,
  onUpdateTitle,
  onImportBoard,
  onDeleteBoard,
  onExportBoard,
  onExportPDF,
  onShare,
  zoom,
  onZoomChange,
  onAddColumn
}) => {
  return (
    <Container>
      <CommandBarLeft>
        <TopBarIcon>
          <AppIcon />
        </TopBarIcon>
        <BoardList
          boards={boards}
          currentBoardId={currentBoardId}
          onBoardSelect={onBoardSelect}
          onCreateBoard={onCreateBoard}
          onUpdateTitle={onUpdateTitle}
          onImportBoard={onImportBoard}
          onDeleteBoard={onDeleteBoard}
        />
        <ExportIconButton onClick={onExportBoard} title="Export as JSON">
          <JsonIcon />
        </ExportIconButton>
        <ExportIconButton onClick={onExportPDF} title="Export as PDF">
          <PdfIcon />
        </ExportIconButton>
        <ExportIconButton onClick={onShare} title="Share Board">
          <ShareIcon />
        </ExportIconButton>
      </CommandBarLeft>
      <CommandBarRight>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
        <ActionButton onClick={onAddColumn}>
          <span>+</span> Add Column
        </ActionButton>
      </CommandBarRight>
    </Container>
  );
};

export default CommandBar; 