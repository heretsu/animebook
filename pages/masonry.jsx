import { useEffect } from 'react';

function MasonryGrid() {
  useEffect(() => {
    const grid = document.getElementById('masonry-grid');
    const items = grid.children;

    const columns = Array.from({ length: 3 }, () => []);

    function getShortestColumn() {
      return columns.reduce((acc, column, index) => {
        if (column.length < columns[acc].length) {
          return index;
        }
        return acc;
      }, 0);
    }

    function updateColumnHeights() {
      columns.forEach((column, index) => {
        const heights = column.map(item => item.clientHeight);
        const maxHeight = Math.max(...heights);
        grid.style.gridAutoRows = `${maxHeight}px`;
      });
    }

    function arrangeItems() {
      Array.from(items).forEach(item => {
        const columnIndex = getShortestColumn();
        columns[columnIndex].push(item);
        grid.appendChild(item);
      });

      updateColumnHeights();
    }

    window.addEventListener('load', arrangeItems);
    window.addEventListener('resize', arrangeItems);

    return () => {
      window.removeEventListener('load', arrangeItems);
      window.removeEventListener('resize', arrangeItems);
    };
  }, []);

  return (
    <div id="masonry-grid" className="pb-12 h-fit grid gap-2 grid-cols-3">
      {/* Your HTML content here */}
    </div>
  );
}

export default MasonryGrid;