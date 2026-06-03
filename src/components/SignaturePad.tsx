import React, { useRef, useState, useEffect } from 'react';
import { SignatureData } from '../types';
import { Edit2, Type, Eraser, Check, X } from 'lucide-react';

interface SignaturePadProps {
  value: SignatureData;
  onChange: (value: SignatureData) => void;
  onClose?: () => void;
}

export default function SignaturePad({ value, onChange, onClose }: SignaturePadProps) {
  const [activeTab, setActiveTab] = useState<'sketch' | 'typed'>(value.type === 'none' ? 'sketch' : value.type);
  const [typedName, setTypedName] = useState(value.typedName || '');
  const [selectedFont, setSelectedFont] = useState(value.typedFont || 'font-serif');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize sketch logic
  useEffect(() => {
    if (activeTab === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Dark Navy Blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      // If there is existing signature data, draw it
      if (value.type === 'sketch' && value.sketchDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value.sketchDataUrl;
      }
    }
  }, [activeTab, value]);

  // Handle sketch drawing
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSketch();
    }
  };

  const saveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    
    // Check if canvas is empty to avoid saving blank frames
    const ctx = canvas.getContext('2d');
    const buffer = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    if (!buffer) return;
    const hasPixels = buffer.data.some(channel => channel !== 0);

    if (hasPixels) {
      onChange({
        type: 'sketch',
        sketchDataUrl: dataUrl,
      });
    }
  };

  const clearSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({ type: 'none' });
  };

  const saveTyped = (nameString: string, fontClass: string) => {
    if (nameString.trim() === '') {
      onChange({ type: 'none' });
    } else {
      onChange({
        type: 'typed',
        typedName: nameString,
        typedFont: fontClass,
      });
    }
  };

  return (
    <div id="signature-pad-modal" className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg max-w-sm w-full mx-auto relative">
      <div className="flex items-center justify-between border-b pb-2 mb-3">
        <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-blue-600" />
          設定簽章蓋印
        </h4>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-0.5 rounded-lg mb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('sketch');
            if (canvasRef.current) clearSketch();
          }}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-md transition-all font-medium ${
            activeTab === 'sketch'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit2 className="w-3 h-3" />
          手寫簽名
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('typed');
            saveTyped(typedName, selectedFont);
          }}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-md transition-all font-medium ${
            activeTab === 'typed'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Type className="w-3 h-3" />
          打字簽章
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sketch' ? (
        <div>
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center overflow-hidden h-40">
            <canvas
              ref={canvasRef}
              width={350}
              height={160}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {value.type !== 'sketch' && !isDrawing && (
              <div className="absolute pointer-events-none text-gray-400 text-xs flex flex-col items-center gap-1 select-none">
                <span>點擊並拖曳滑鼠或利用觸控螢幕在此處手寫</span>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2.5">
            <button
              type="button"
              onClick={clearSketch}
              className="flex items-center gap-1 px-2.5 py-1 text-xs border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-md transition-colors"
            >
              <Eraser className="w-3 h-3" />
              清除
            </button>
            <span className="text-[10px] text-gray-400 flex items-center">簽章會即時顯示於預覽發票右下方</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">簽署名稱</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                saveTyped(e.target.value, selectedFont);
              }}
              placeholder="例如：林明軒 簽署"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">選擇風格</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'font-serif', label: '典雅襯線', preview: 'serif' },
                { id: 'font-sans', label: '簡約現代', preview: 'sans' },
                { id: 'cursive-writing-1', label: '草寫行規', preview: 'script' },
                { id: 'cursive-writing-2', label: '溫潤手感', preview: 'handwrite' },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    setSelectedFont(font.id);
                    saveTyped(typedName, font.id);
                  }}
                  className={`border p-2 rounded-md text-left transition-all hover:bg-gray-50 flex flex-col ${
                    selectedFont === font.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-medium'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-[10px] text-gray-400 block">{font.label}</span>
                  <span className={`text-sm tracking-wide ${font.id} truncate mt-0.5`}>
                    {typedName || '專屬簽名'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Close / Confirm */}
      <div className="mt-4 pt-3 flex justify-end gap-2 border-t text-xs">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            完成設定
          </button>
        )}
      </div>
    </div>
  );
}
