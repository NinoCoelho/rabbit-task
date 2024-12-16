import React from 'react';
import styled from 'styled-components';
import { PdfIcon } from '../Icons';

const CommandBarContainer = styled.div`
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const BackArrow = styled.button`
  padding: 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;

  &:hover {
    color: #0052cc;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5M5 12L12 5l7 7"/>
  </svg>
);

const FlowCommandBar = ({
  onExportPdf
}) => {
  const handleBackToKanban = () => {
    window.location.href = '/';
  };

  return (
    <CommandBarContainer>
      <BackArrow onClick={handleBackToKanban} title="Back to Kanban">
        <ArrowUpIcon />
        Back to Kanban
      </BackArrow>
      
      <ActionButton onClick={onExportPdf} title="Export as PDF">
        <PdfIcon />
      </ActionButton>
    </CommandBarContainer>
  );
};

export default FlowCommandBar; 