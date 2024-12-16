import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: white;
  border-radius: 4px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2c3e50;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  font-family: monospace;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: ${props => props.$primary ? '#0052cc' : 'white'};
  color: ${props => props.$primary ? 'white' : '#444'};
  cursor: pointer;

  &:hover {
    background: ${props => props.$primary ? '#0047b3' : '#f8f9fa'};
  }
`;

function ChecklistDialog({ title, items, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: title || '',
    items: items ? items.map(item => `${item.checked ? '[x]' : '[ ]'} ${item.text}`).join('\n') : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItems = formData.items
      .split('\n')
      .filter(text => text.trim())
      .map(text => {
        const isChecked = text.startsWith('[x]');
        const itemText = text.replace(/^\[[ x]\]\s*/, '').trim();
        return { text: itemText, checked: isChecked };
      });

    onSave(formData.title, newItems);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Title>{title ? 'Edit Checklist' : 'New Checklist'}</Title>
        <form onSubmit={handleSubmit}>
          <Field>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter checklist title"
              required
            />
          </Field>
          <Field>
            <Label>Items (one per line)</Label>
            <TextArea
              value={formData.items}
              onChange={e => setFormData({ ...formData, items: e.target.value })}
              placeholder="[ ] Item 1&#10;[ ] Item 2&#10;[ ] Item 3"
              required
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Use [x] for checked items and [ ] for unchecked items
            </div>
          </Field>
          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" $primary>Save</Button>
          </ButtonGroup>
        </form>
      </Dialog>
    </Overlay>
  );
}

export default ChecklistDialog; 