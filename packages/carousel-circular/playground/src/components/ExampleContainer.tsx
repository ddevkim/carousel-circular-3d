import type { CarouselCircularProps } from '@ddevkim/carousel-circular';
import { CarouselCircular } from '@ddevkim/carousel-circular';

/**
 * ExampleContainer Props
 */
interface ExampleContainerProps {
  /** Example title */
  title: string;
  /** Optional description text */
  description?: string;
  /** CarouselCircular component props (including items) */
  carouselProps: CarouselCircularProps;
}

/**
 * Reusable container component for carousel examples.
 * Provides consistent layout with title, optional description, and carousel.
 *
 * @param props - ExampleContainerProps
 * @returns ExampleContainer component
 */
export function ExampleContainer({ title, description, carouselProps }: ExampleContainerProps) {
  return (
    <div className="example">
      <h2 className="example-title">{title}</h2>
      {description && <p className="example-description">{description}</p>}
      <CarouselCircular {...carouselProps} />
    </div>
  );
}
