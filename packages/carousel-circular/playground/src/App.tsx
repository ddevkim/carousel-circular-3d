import { useState } from "react";
import type { AlbumName } from "./utils/albumHelper";
import { getAlbums } from "./utils/albumHelper";
import { AutoRotateExample } from "./examples/AutoRotateExample";
import { BasicExample } from "./examples/BasicExample";
import { CustomContentExample } from "./examples/CustomContentExample";
import "./App.css";

type ExampleType = "basic" | "auto-rotate" | "custom-content";

export function App() {
  const [activeExample, setActiveExample] = useState<ExampleType>("basic");
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumName>("studio");

  return (
    <div className="app">
      <header className="header">
        <h1>@ddevkim/carousel-circular</h1>
        <p>3D Circular Carousel Component Playground</p>
      </header>

      <nav className="nav">
        <div className="nav-album-section">
          <label htmlFor="album-select">Album:</label>
          <select
            id="album-select"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value as AlbumName)}
            className="album-dropdown"
          >
            {getAlbums().map((album) => (
              <option key={album} value={album}>
                {album.charAt(0).toUpperCase() + album.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="nav-buttons-section">
          <button
            type="button"
            className={activeExample === "basic" ? "active" : ""}
            onClick={() => setActiveExample("basic")}
          >
            Basic Usage
          </button>
          <button
            type="button"
            className={activeExample === "auto-rotate" ? "active" : ""}
            onClick={() => setActiveExample("auto-rotate")}
          >
            Auto Rotate
          </button>
          <button
            type="button"
            className={activeExample === "custom-content" ? "active" : ""}
            onClick={() => setActiveExample("custom-content")}
          >
            Custom Content
          </button>
        </div>
      </nav>

      <main className="main">
        {activeExample === "basic" && <BasicExample album={selectedAlbum} />}
        {activeExample === "auto-rotate" && <AutoRotateExample album={selectedAlbum} />}
        {activeExample === "custom-content" && <CustomContentExample />}
      </main>

      <footer className="footer">
        <p>
          Drag to rotate | Use Arrow keys ← → | Mouse enter/leave to control
          auto-rotate
        </p>
      </footer>
    </div>
  );
}
