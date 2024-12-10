import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const TitleContainer = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  margin: -4px;
  
  &:focus {
    outline: none;
    border-color: #0052cc;
    box-shadow: 0 0 0 1px #0052cc;
  }
`;

function BoardTitle({ title, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleSubmit = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <TitleInput
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <TitleContainer onClick={() => setIsEditing(true)}>
      <Title>{title}</Title>
    </TitleContainer>
  );
}

export default BoardTitle; 