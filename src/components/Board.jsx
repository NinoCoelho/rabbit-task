const Board = () => {
  const {
    state,
    handleZoomChange,
    // ... other hooks
  } = useBoard(initialData);

  const currentBoard = state.boards.find(b => b.id === state.currentBoardId);

  return (
    <Container>
      <BoardContainer
        currentBoard={currentBoard}
        onZoomChange={handleZoomChange}
        // ... other props
      />
      <ZoomControl
        value={currentBoard.zoom || 1}
        onChange={handleZoomChange}
      />
    </Container>
  );
};

export default Board; 