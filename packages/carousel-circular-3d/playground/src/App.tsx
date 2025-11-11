import type { CarouselItem } from '@ddevkim/carousel-circular-3d';
import { CarouselCircular } from '@ddevkim/carousel-circular-3d';
import { useEffect, useState } from 'react';
import type { AlbumName } from './utils/albumHelper';
import { createAlbumItems, getAlbums } from './utils/albumHelper';
import './App.css';

/**
 * Geometry 파라미터 타입
 */
interface GeometryControls {
  radius: number;
  perspective: number;
  cameraAngle: number;
  depthIntensity: number;
}

/**
 * 기본 geometry 값
 */
const DEFAULT_GEOMETRY: GeometryControls = {
  radius: 880,
  perspective: 2200, // radius * 3.33
  cameraAngle: 0,
  depthIntensity: 2,
};

export function App() {
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumName>('bali');
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [geometry, setGeometry] = useState<GeometryControls>(DEFAULT_GEOMETRY);
  const [enableReflection, setEnableReflection] = useState(true);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const [isAlbumDropdownOpen, setIsAlbumDropdownOpen] = useState(false);

  // 컨테이너 기본 높이
  const containerHeight = 500;

  // 앨범 로드
  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    createAlbumItems(selectedAlbum).then((loadedItems) => {
      if (isMounted) {
        setItems(loadedItems);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedAlbum]);

  // Dropdown 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isAlbumDropdownOpen && !target.closest('.custom-select-wrapper')) {
        setIsAlbumDropdownOpen(false);
      }
    };

    if (isAlbumDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isAlbumDropdownOpen]);

  /**
   * Slider 변경 핸들러
   */
  const handleGeometryChange = (key: keyof GeometryControls, value: number) => {
    setGeometry((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Album 선택 핸들러
   */
  const handleAlbumSelect = (album: AlbumName) => {
    setSelectedAlbum(album);
    setIsAlbumDropdownOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>@ddevkim/carousel-circular-3d</h1>
        <p>3D Circular Carousel with Interactive Controls</p>
      </header>

      <nav className="nav">
        <div className="nav-controls-section">
          {/* Album Selector */}
          <div className="control-group control-group-toggle">
            <label htmlFor="album-select">Album</label>
            <div className="custom-select-wrapper">
              <button
                id="album-select"
                type="button"
                className="custom-select-button"
                onClick={() => setIsAlbumDropdownOpen(!isAlbumDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isAlbumDropdownOpen}
              >
                {selectedAlbum.charAt(0).toUpperCase() + selectedAlbum.slice(1)}
              </button>
              {isAlbumDropdownOpen && (
                <div className="custom-select-dropdown">
                  {getAlbums().map((album) => (
                    <button
                      key={album}
                      type="button"
                      className={`custom-select-option ${album === selectedAlbum ? 'selected' : ''}`}
                      onClick={() => handleAlbumSelect(album)}
                    >
                      {album.charAt(0).toUpperCase() + album.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="control-group control-group-toggle">
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setGeometry(DEFAULT_GEOMETRY);
                setEnableReflection(true);
                setAutoRotateEnabled(true);
              }}
              aria-label="Reset all controls to default values"
            >
              Reset
            </button>
          </div>

          {/* Reflection Toggle */}
          <div className="control-group control-group-toggle">
            <label htmlFor="reflection-toggle">Reflection</label>
            <button
              id="reflection-toggle"
              type="button"
              className={`toggle-button ${enableReflection ? 'active' : ''}`}
              onClick={() => setEnableReflection(!enableReflection)}
              aria-pressed={enableReflection}
            >
              {enableReflection ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Auto-Rotate Toggle */}
          <div className="control-group control-group-toggle">
            <label htmlFor="auto-rotate-toggle">Auto-Rotate</label>
            <button
              id="auto-rotate-toggle"
              type="button"
              className={`toggle-button ${autoRotateEnabled ? 'active' : ''}`}
              onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
              aria-pressed={autoRotateEnabled}
            >
              {autoRotateEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          {/* Radius Control */}
          <div className="control-group">
            <label htmlFor="radius-control">
              Radius: <span className="control-value">{geometry.radius}px</span>
            </label>
            <input
              id="radius-control"
              type="range"
              min="400"
              max="1500"
              step="10"
              value={geometry.radius}
              onChange={(e) => handleGeometryChange('radius', Number(e.target.value))}
            />
          </div>

          {/* Perspective Control */}
          <div className="control-group">
            <label htmlFor="perspective-control">
              Perspective: <span className="control-value">{geometry.perspective}px</span>
            </label>
            <input
              id="perspective-control"
              type="range"
              min="1000"
              max="5000"
              step="10"
              value={geometry.perspective}
              onChange={(e) => handleGeometryChange('perspective', Number(e.target.value))}
            />
          </div>

          {/* Camera Angle Control */}
          <div className="control-group">
            <label htmlFor="camera-angle-control">
              Camera Angle: <span className="control-value">{geometry.cameraAngle}°</span>
            </label>
            <input
              id="camera-angle-control"
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={geometry.cameraAngle}
              onChange={(e) => handleGeometryChange('cameraAngle', Number(e.target.value))}
            />
          </div>

          {/* Depth Intensity Control */}
          <div className="control-group">
            <label htmlFor="depth-intensity-control">
              Depth Intensity: <span className="control-value">{geometry.depthIntensity}</span>
            </label>
            <input
              id="depth-intensity-control"
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={geometry.depthIntensity}
              onChange={(e) => handleGeometryChange('depthIntensity', Number(e.target.value))}
            />
          </div>
        </div>
      </nav>

      <main className="main">
        <div className="example-section">
          <div className="example-header">
            <h2>Interactive 3D Carousel</h2>
            <p>
              Click images to open lightbox • Drag to rotate • Use arrow keys • Auto-rotation
              enabled with reflection effects
            </p>
          </div>

          <div className="carousel-wrapper">
            {isLoading || items.length === 0 ? (
              <div className="loading-placeholder">Loading album...</div>
            ) : (
              <CarouselCircular
                containerHeight={containerHeight}
                items={items}
                enableLightboxWhenClick={true}
                lightboxOptions={{
                  enableKeyboardNavigation: true,
                  closeOnEsc: true,
                }}
                style={{
                  className: 'carousel-container',
                  itemClassName: 'carousel-item',
                }}
                geometry={{
                  radius: geometry.radius,
                  perspective: geometry.perspective,
                  cameraAngle: geometry.cameraAngle,
                  depthIntensity: geometry.depthIntensity,
                }}
                visualEffect={{
                  opacityRange: [0.3, 1],
                  scaleRange: [0.7, 1],
                  enableReflection: enableReflection,
                }}
                autoRotateConfig={{
                  enabled: autoRotateEnabled,
                  speed: 0.02,
                  resumeDelay: 1500,
                }}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Features: Lightbox • Auto-rotation • Reflection effects • Dynamic geometry controls •
          Keyboard navigation • LQIP progressive loading
        </p>
      </footer>
    </div>
  );
}
