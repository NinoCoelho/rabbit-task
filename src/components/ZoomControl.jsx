import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: #ddd;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #0052cc;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #0052cc;
    cursor: pointer;
    border: none;
  }
`;

const ZoomControl = ({ zoom = 1, onZoomChange }) => {
  if (!onZoomChange) return null; // Safety check

  return (
    <Container>
      <Slider
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={zoom}
        onChange={(e) => onZoomChange(e.target.value)}
      />
      <span>{Math.round(zoom * 100)}%</span>
    </Container>
  );
};

export default ZoomControl; 