import type { CarouselItem } from '@ddevkim/carousel-circular';
import { ExampleContainer } from '../components/ExampleContainer';

const items: CarouselItem[] = [
  {
    id: 1,
    content: (
      <div className="custom-card" style={{ background: 'rgba(255, 99, 132, 0.2)' }}>
        <h3>React</h3>
        <p>A JavaScript library for building user interfaces</p>
      </div>
    ),
    alt: 'React Card',
  },
  {
    id: 2,
    content: (
      <div className="custom-card" style={{ background: 'rgba(54, 162, 235, 0.2)' }}>
        <h3>TypeScript</h3>
        <p>JavaScript with syntax for types</p>
      </div>
    ),
    alt: 'TypeScript Card',
  },
  {
    id: 3,
    content: (
      <div className="custom-card" style={{ background: 'rgba(255, 206, 86, 0.2)' }}>
        <h3>Vite</h3>
        <p>Next Generation Frontend Tooling</p>
      </div>
    ),
    alt: 'Vite Card',
  },
  {
    id: 4,
    content: (
      <div className="custom-card" style={{ background: 'rgba(75, 192, 192, 0.2)' }}>
        <h3>pnpm</h3>
        <p>Fast, disk space efficient package manager</p>
      </div>
    ),
    alt: 'pnpm Card',
  },
  {
    id: 5,
    content: (
      <div className="custom-card" style={{ background: 'rgba(153, 102, 255, 0.2)' }}>
        <h3>Biome</h3>
        <p>One toolchain for your web project</p>
      </div>
    ),
    alt: 'Biome Card',
  },
  {
    id: 6,
    content: (
      <div className="custom-card" style={{ background: 'rgba(255, 159, 64, 0.2)' }}>
        <h3>Changesets</h3>
        <p>A way to manage your versioning and changelogs</p>
      </div>
    ),
    alt: 'Changesets Card',
  },
];

export function CustomContentExample() {
  return (
    <ExampleContainer
      title="Custom Content - React Nodes"
      carouselProps={{
        items,
        geometry: {
          cameraAngle: 10,
          depthIntensity: 1.2,
        },
        style: { className: 'carousel-container', itemClassName: 'carousel-item' },
        visualEffect: { opacityRange: [0.2, 1], scaleRange: [0.6, 1] },
      }}
    />
  );
}
