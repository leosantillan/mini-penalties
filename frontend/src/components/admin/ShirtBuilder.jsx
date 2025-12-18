import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Undo, Redo, Trash2, Download } from 'lucide-react';

const GRID_SIZE = 12;

const ShirtBuilder = ({ initialDesign, onSave, teamColors }) => {
  const [grid, setGrid] = useState([]);
  const [selectedColor, setSelectedColor] = useState(teamColors?.color || '#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    // Initialize grid
    if (initialDesign && initialDesign.grid) {
      setGrid(initialDesign.grid);
      setHistory([initialDesign.grid]);
      setHistoryIndex(0);
    } else {
      const emptyGrid = Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill('#FFFFFF')
      );
      setGrid(emptyGrid);
      setHistory([emptyGrid]);
      setHistoryIndex(0);
    }
  }, [initialDesign]);

  const saveToHistory = (newGrid) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newGrid)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCellClick = (row, col) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = selectedColor;
    setGrid(newGrid);
    saveToHistory(newGrid);
  };

  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = selectedColor;
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory(grid);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGrid(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleClear = () => {
    const emptyGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill('#FFFFFF')
    );
    setGrid(emptyGrid);
    saveToHistory(emptyGrid);
  };

  const handleSave = () => {
    onSave({ grid });
  };

  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    const cellSize = 40;
    canvas.width = GRID_SIZE * cellSize;
    canvas.height = GRID_SIZE * cellSize;
    const ctx = canvas.getContext('2d');

    grid.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = color;
        ctx.fillRect(
          colIndex * cellSize,
          rowIndex * cellSize,
          cellSize,
          cellSize
        );
      });
    });

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shirt-design.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const presetColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#000080', '#808080', '#000000',
    '#FFFFFF', '#FFC0CB', '#A52A2A', '#FFD700', '#C0C0C0', '#FF6347'
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex-1">
          <Label>Selected Color</Label>
          <div className="flex gap-2 items-center mt-1">
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-24"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4 mr-1" />
            Redo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportImage}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Color Presets */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <Label className="mb-2 block">Quick Colors</Label>
        <div className="grid grid-cols-9 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-10 h-10 rounded border-2 transition-all ${
                selectedColor === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex justify-center">
        <div
          className="inline-block border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="bg-white">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((color, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="cursor-pointer border border-gray-200 transition-all hover:opacity-80"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color,
                    }}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Shirt Design
        </Button>
      </div>
    </div>
  );
};

export default ShirtBuilder;