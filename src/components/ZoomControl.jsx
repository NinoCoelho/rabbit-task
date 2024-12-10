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

const ZoomLabel = styled.span`
  font-size: 12px;
  color: #666;
  min-width: 40px;
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

function ZoomControl({ zoom, onZoomChange }) {
  return (
    <Container>
      <ZoomLabel>{Math.round(zoom * 100)}%</ZoomLabel>
      <Slider
        min="0.5"
        max="1.5"
        step="0.1"
        value={zoom}
        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
      />
    </Container>
  );
}

export default ZoomControl; 