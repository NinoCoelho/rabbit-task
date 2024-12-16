import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import FlowToolbar from './FlowToolbar';
import FlowCanvas from './FlowCanvas';
import FlowCommandBar from './FlowCommandBar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { encodeBoard, getBoardFromUrl } from '../../utils/urlUtils';
import ImportDialog from '../../components/ImportDialog';

const Container = styled.div`
  height: 100vh;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const initialShape = {
  id: 'shape-1',
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 120,
  height: 60,
  text: 'New Shape',
  connections: []
};

function FlowDiagram() {
  const [diagrams, setDiagrams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    const diagramId = params.get('diagramId');

    if (taskId && diagramId) {
      const savedTaskDiagram = localStorage.getItem(`taskDiagram_${taskId}`);
      if (savedTaskDiagram) {
        try {
          const diagram = JSON.parse(savedTaskDiagram);
          return [diagram];
        } catch (error) {
          console.error('Error parsing task diagram:', error);
        }
      }
      return [{
        id: diagramId,
        title: 'Task Diagram',
        shapes: [
          {
            id: 'shape-1',
            type: 'start',
            x: 100,
            y: 100,
            width: 120,
            height: 60,
            text: 'Start',
            connections: []
          }
        ],
        connections: []
      }];
    }

    const saved = localStorage.getItem('flowDiagrams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved diagrams:', error);
        return [{ id: 'diagram-1', title: 'New Diagram', shapes: [initialShape], connections: [] }];
      }
    }
    return [{ id: 'diagram-1', title: 'New Diagram', shapes: [initialShape], connections: [] }];
  });

  const [currentDiagramId, setCurrentDiagramId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('diagramId') || diagrams[0]?.id;
  });

  const currentDiagram = diagrams.find(d => d.id === currentDiagramId) || diagrams[0];

  const [selectedShape, setSelectedShape] = useState(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const canvasRef = useRef(null);
  const [importDialogData, setImportDialogData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [diagramId, setDiagramId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    const diagramId = params.get('diagramId');
    
    if (taskId && diagramId) {
      setTaskId(taskId);
      setDiagramId(diagramId);
    }
  }, []);

  useEffect(() => {
    if (taskId && currentDiagram) {
      localStorage.setItem(`taskDiagram_${taskId}`, JSON.stringify(currentDiagram));
    } else if (!taskId) {
      localStorage.setItem('flowDiagrams', JSON.stringify(diagrams));
    }
  }, [diagrams, currentDiagram, taskId]);

  useEffect(() => {
    localStorage.setItem('flowDiagrams', JSON.stringify(diagrams));
  }, [diagrams]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    if (taskId) {
      const savedState = localStorage.getItem('kanbanState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const boards = state.boards || [];
          for (const board of boards) {
            const task = Object.values(board.tasks || {}).find(t => t.id === taskId);
            if (task) {
              setTaskTitle(task.title);
              break;
            }
          }
        } catch (error) {
          console.error('Error getting task title:', error);
        }
      }
    }
  }, []);

  const handleAddShape = (shapeType, x = 100, y = 100, title = null, items = null) => {
    const size = shapeType === 'diamond' ? 60 : 
                shapeType === 'note' || shapeType === 'checklist' ? 200 : 120;
    const newShape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: x,
      y: y,
      width: shapeType === 'end' ? 30 : size,
      height: shapeType === 'diamond' ? size : 
             shapeType === 'note' || shapeType === 'checklist' ? 150 : 60,
      text: title || (
        shapeType === 'start' ? 'Start' : 
        shapeType === 'note' ? 'Double click to edit...' :
        shapeType === 'checklist' ? 'Checklist Title' : 'New Shape'
      ),
      items: items || (shapeType === 'checklist' ? [
        { text: 'Item 1', checked: false },
        { text: 'Item 2', checked: false },
        { text: 'Item 3', checked: false }
      ] : undefined),
      connections: []
    };

    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? { ...diagram, shapes: [...diagram.shapes, newShape] }
        : diagram
    ));
  };

  const handleShapeMove = (shapeId, x, y) => {
    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? {
            ...diagram,
            shapes: diagram.shapes.map(shape =>
              shape.id === shapeId
                ? { ...shape, x, y }
                : shape
            )
          }
        : diagram
    ));
  };

  const handleTextEdit = (shapeId, text) => {
    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? {
            ...diagram,
            shapes: diagram.shapes.map(shape =>
              shape.id === shapeId
                ? { ...shape, text }
                : shape
            )
          }
        : diagram
    ));
  };

  const handleCreateConnection = (fromId, toId) => {
    if (fromId === toId) return; // Prevent self-connections
    
    const newConnection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId
    };

    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? {
            ...diagram,
            connections: [...diagram.connections, newConnection]
          }
        : diagram
    ));
  };

  const handleExportJson = () => {
    try {
      const dataStr = JSON.stringify(currentDiagram, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create formatted date string
      const now = new Date();
      const dateStr = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);
      
      const filename = `${currentDiagram.title.toLowerCase().replace(/\s+/g, '-')}_${dateStr}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting diagram:', error);
      alert('Failed to export the diagram. Please try again.');
    }
  };

  const handleExportPdf = async () => {
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      // Save current scroll position
      const originalScrollLeft = canvasElement.scrollLeft;
      const originalScrollTop = canvasElement.scrollTop;

      // Get the full dimensions
      const width = canvasElement.scrollWidth;
      const height = canvasElement.scrollHeight;

      // Create canvas
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: width,
        height: height + 20,
        windowWidth: width,
        windowHeight: height + 20,
        allowTaint: true
      });

      // Restore scroll position
      canvasElement.scrollLeft = originalScrollLeft;
      canvasElement.scrollTop = originalScrollTop;

      // Create PDF
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save with date and time
      const now = new Date();
      const dateTime = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);

      const filename = `${currentDiagram.title.toLowerCase().replace(/\s+/g, '-')}_${dateTime}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.origin;
    const encodedDiagram = encodeBoard(currentDiagram);
    const shareUrl = `${currentUrl}/draw?diagram=${encodedDiagram}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy share link');
    });
  };

  // Add useEffect to handle URL parameters
  useEffect(() => {
    const diagramFromUrl = getBoardFromUrl();
    if (diagramFromUrl) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const existingDiagram = diagrams.find(d => d.title === diagramFromUrl.title);
      if (existingDiagram) {
        setImportDialogData(diagramFromUrl);
      } else {
        handleImportDiagram(diagramFromUrl);
      }
    }
  }, []);

  const handleImportDiagram = (diagram, createNew = false) => {
    const existingDiagram = diagrams.find(d => d.title === diagram.title);
    
    if (existingDiagram && !createNew) {
      // Override existing diagram
      const updatedDiagrams = diagrams.map(d => 
        d.id === existingDiagram.id ? { ...diagram, id: existingDiagram.id } : d
      );
      setDiagrams(updatedDiagrams);
      setCurrentDiagramId(existingDiagram.id);
    } else {
      // Create new diagram with modified title if needed
      let newTitle = diagram.title;
      if (existingDiagram) {
        const now = new Date().toISOString().replace(/[:.]/g, '-');
        newTitle = `${diagram.title} (Imported ${now})`;
      }
      const newDiagram = { ...diagram, id: Date.now().toString(), title: newTitle };
      setDiagrams([...diagrams, newDiagram]);
      setCurrentDiagramId(newDiagram.id);
    }
    setImportDialogData(null);
  };

  const handleDeleteShape = (shapeId) => {
    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? {
            ...diagram,
            shapes: diagram.shapes.filter(shape => shape.id !== shapeId),
            // Also remove any connections to/from this shape
            connections: diagram.connections.filter(conn => 
              conn.from !== shapeId && conn.to !== shapeId
            )
          }
        : diagram
    ));
  };

  const handleDeleteConnection = (connectionId) => {
    setDiagrams(prev => prev.map(diagram => 
      diagram.id === currentDiagramId
        ? {
            ...diagram,
            connections: diagram.connections.filter(conn => conn.id !== connectionId)
          }
        : diagram
    ));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'new-shape') {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scrollLeft = canvasRef.current.scrollLeft;
        const scrollTop = canvasRef.current.scrollTop;
        
        const x = e.clientX - canvasRect.left + scrollLeft;
        const y = e.clientY - canvasRect.top + scrollTop;
        
        onAddShape(data.shapeType, x, y);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <Container>
      <FlowCommandBar
        onExportPdf={handleExportPdf}
      />
      <MainContainer>
        <FlowToolbar onAddShape={handleAddShape} />
        <FlowCanvas
          ref={canvasRef}
          diagram={currentDiagram}
          selectedShape={selectedShape}
          onSelectShape={setSelectedShape}
          onShapeMove={handleShapeMove}
          onTextEdit={handleTextEdit}
          isDrawingConnection={isDrawingConnection}
          onCreateConnection={handleCreateConnection}
          onDeleteShape={handleDeleteShape}
          onAddShape={handleAddShape}
          onDeleteConnection={handleDeleteConnection}
          title={taskTitle}
          onDrop={handleDrop}
        />
      </MainContainer>
      {importDialogData && (
        <ImportDialog
          title="Import Diagram"
          itemName={importDialogData.title}
          onCreateNew={() => handleImportDiagram(importDialogData, true)}
          onOverride={() => handleImportDiagram(importDialogData, false)}
          onCancel={() => setImportDialogData(null)}
        />
      )}
    </Container>
  );
}

export default FlowDiagram; 