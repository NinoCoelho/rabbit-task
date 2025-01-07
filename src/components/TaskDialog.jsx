import React, { useState } from 'react';
import styled from 'styled-components';
import { FlowIcon } from './Icons';

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
  width: 500px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DateField = styled(Field)`
  width: 200px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #444;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f8f9fa;
  }

  &.primary {
    background: #0052cc;
    color: white;
    border-color: #0052cc;

    &:hover {
      background: #0047b3;
    }
  }

  &.danger {
    color: #dc3545;
    
    &:hover {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
  }
`;

function TaskDialog({ task, onClose, onUpdate, onDelete, isNew = false }) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate || '',
    done: task.done || false,
    completedAt: task.completedAt || null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task) {
      console.error('Task is undefined');
      return;
    }
    if (!formData.title.trim()) {
      return;
    }
    onUpdate(task.id, {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      done: formData.done,
      completedAt: formData.done ? (formData.completedAt || new Date().toISOString()) : null
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>{isNew ? 'New Task' : 'Edit Task'}</Title>
          </HeaderLeft>
          <HeaderRight>
            <CloseButton onClick={onClose}>×</CloseButton>
          </HeaderRight>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </Field>
          <DateField>
            <Label>Due Date (optional)</Label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </DateField>
          {formData.dueDate && (
            <Field>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.done}
                  onChange={e => setFormData({ 
                    ...formData, 
                    done: e.target.checked,
                    completedAt: e.target.checked ? new Date().toISOString() : null
                  })}
                />
                {' '}Mark as done
              </Label>
              {formData.done && formData.completedAt && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Completed: {new Date(formData.completedAt).toLocaleString()}
                </div>
              )}
            </Field>
          )}
          <Actions>
            {!isNew && (
              <Button type="button" className="danger" onClick={handleDelete}>
                Delete Task
              </Button>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="primary">
                {isNew ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </Actions>
        </Form>
      </Dialog>
    </Overlay>
  );
}

export default TaskDialog;
