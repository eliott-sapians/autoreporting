import clsx from 'clsx';
import styles from './corner.module.css';

export type CornerPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface CornerProps {
  position: CornerPosition;
  /**  
   * Optional: override the default colour (#F7FF54).
   * Accepts any valid CSS colour string (hex, rgb, hsl, etc.).
   */
  color?: string;
  /**
   * Optional: distance from the edge (defaults to 2 rem = 32 px)
   */
  offset?: string | number;
  /**
   * Optional: length of the two arms (defaults to 3.5 rem = 56 px)
   */
  length?: string | number;
  /**
   * Optional: thickness of each arm (defaults to 0.75 rem = 12 px)
   */
  thickness?: string | number;
}

export default function Corner({
  position,
  color,
  offset = '2rem',
  length = '4.5rem',
  thickness = '1.5rem',
}: CornerProps) {
  /**
   * A single empty <span> + two pseudo-elements (::before & ::after) create
   * the "L".  We set the custom properties here so the CSS stays generic.
   */
  return (
    <span
      className={clsx(styles.corner, styles[position])}
      style={
        {
          '--corner-color': color,
          '--corner-offset': typeof offset === 'number' ? `${offset}px` : offset,
          '--corner-length':
            typeof length === 'number' ? `${length}px` : length,
          '--corner-thickness':
            typeof thickness === 'number' ? `${thickness}px` : thickness,
        } as React.CSSProperties
      }
    />
  );
} 