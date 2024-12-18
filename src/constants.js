export const MEMBER_COLORS = [
  '#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0',
  '#00BCD4', '#E91E63', '#3F51B5', '#009688', '#FFC107'
]; 

export const STORAGE_KEYS = {
  KANBAN_STATE: 'kanbanState',
  TASK_DIAGRAM: 'taskDiagram_'
};

// Default board structure
export const DEFAULT_BOARD = {
  title: 'Untitled Board',
  tasks: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: [],
    }
  },
  columnOrder: ['column-1'],
  zoom: 1,
  members: [],
};

// ... other constants 