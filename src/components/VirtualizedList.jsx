/**
 * High-Performance Virtualized List Component
 * Handles large datasets efficiently with virtual scrolling
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrottledCallback } from '../utils/performanceOptimization';
import PropTypes from 'prop-types';

// Virtualized List Item Component
const VirtualListItem = memo(
  ({ item, index, style, renderItem, isVisible, measureRef }) => {
    return (
      <div
        ref={measureRef}
        style={style}
        className={`virtual-list-item ${isVisible ? 'visible' : 'hidden'}`}
        data-index={index}
      >
        {isVisible && renderItem(item, index)}
      </div>
    );
  }
);

// Main Virtualized List Component
const VirtualizedList = memo(
  ({
    items = [],
    itemHeight = 50,
    containerHeight = 400,
    renderItem,
    className = '',
    overscan = 5,
    threshold = 0.1,
    onScroll,
    estimatedItemHeight,
    variableHeight = false,
    ...props
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [itemHeights, setItemHeights] = useState(new Map());

    const containerRef = useRef();
    const scrollTimeoutRef = useRef();
    const observerRef = useRef();
    const measureRefs = useRef(new Map());

    // Calculate visible range with overscan
    const visibleRange = useMemo(() => {
      if (!items.length) return { start: 0, end: 0 };

      let start, end;

      if (variableHeight) {
        // Calculate based on measured heights
        let accumulatedHeight = 0;
        start = 0;

        for (let i = 0; i < items.length; i++) {
          const height =
            itemHeights.get(i) || estimatedItemHeight || itemHeight;
          if (accumulatedHeight + height > scrollTop) {
            start = Math.max(0, i - overscan);
            break;
          }
          accumulatedHeight += height;
        }

        accumulatedHeight = 0;
        for (let i = start; i < items.length; i++) {
          const height =
            itemHeights.get(i) || estimatedItemHeight || itemHeight;
          accumulatedHeight += height;
          if (accumulatedHeight > containerHeight + overscan * itemHeight) {
            end = Math.min(items.length, i + overscan);
            break;
          }
        }
        end = end || items.length;
      } else {
        // Fixed height calculation
        start = Math.floor(scrollTop / itemHeight);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        start = Math.max(0, start - overscan);
        end = Math.min(items.length, start + visibleCount + overscan * 2);
      }

      return { start, end };
    }, [
      scrollTop,
      items.length,
      itemHeight,
      containerHeight,
      overscan,
      variableHeight,
      itemHeights,
      estimatedItemHeight,
    ]);

    // Calculate total height
    const totalHeight = useMemo(() => {
      if (variableHeight) {
        let height = 0;
        for (let i = 0; i < items.length; i++) {
          height += itemHeights.get(i) || estimatedItemHeight || itemHeight;
        }
        return height;
      }
      return items.length * itemHeight;
    }, [
      items.length,
      itemHeight,
      variableHeight,
      itemHeights,
      estimatedItemHeight,
    ]);

    // Calculate offset for first visible item
    const offsetY = useMemo(() => {
      if (variableHeight) {
        let offset = 0;
        for (let i = 0; i < visibleRange.start; i++) {
          offset += itemHeights.get(i) || estimatedItemHeight || itemHeight;
        }
        return offset;
      }
      return visibleRange.start * itemHeight;
    }, [
      visibleRange.start,
      variableHeight,
      itemHeights,
      estimatedItemHeight,
      itemHeight,
    ]);

    // Visible items array
    const visibleItems = useMemo(() => {
      const items_slice = items.slice(visibleRange.start, visibleRange.end);
      return items_slice.map((item, index) => ({
        item,
        index: visibleRange.start + index,
        offsetY: variableHeight
          ? (() => {
              let offset = offsetY;
              for (let i = 0; i < index; i++) {
                offset +=
                  itemHeights.get(visibleRange.start + i) ||
                  estimatedItemHeight ||
                  itemHeight;
              }
              return offset;
            })()
          : offsetY + index * itemHeight,
      }));
    }, [
      items,
      visibleRange,
      offsetY,
      variableHeight,
      itemHeights,
      estimatedItemHeight,
      itemHeight,
    ]);

    // Throttled scroll handler
    const handleScroll = useThrottledCallback(e => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after a delay
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Call external scroll handler if provided
      onScroll?.(e);
    }, 16); // ~60fps

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!threshold) return;

      observerRef.current = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const index = parseInt(entry.target.dataset.index);
            if (entry.isIntersecting) {
              // Item is visible, maybe trigger data loading
            }
          });
        },
        { threshold }
      );

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [threshold]);

    // Measure item heights for variable height mode
    const measureItemHeight = useCallback(
      (index, element) => {
        if (!variableHeight || !element) return;

        const height = element.getBoundingClientRect().height;
        setItemHeights(prev => {
          const newMap = new Map(prev);
          newMap.set(index, height);
          return newMap;
        });
      },
      [variableHeight]
    );

    // Create measure ref for each item
    const createMeasureRef = useCallback(
      index => element => {
        measureRefs.current.set(index, element);
        measureItemHeight(index, element);

        if (observerRef.current && element) {
          observerRef.current.observe(element);
        }
      },
      [measureItemHeight]
    );

    // Scroll to specific item
    const scrollToItem = useCallback(
      (index, align = 'auto') => {
        if (!containerRef.current) return;

        let scrollTo = 0;

        if (variableHeight) {
          for (let i = 0; i < index; i++) {
            scrollTo += itemHeights.get(i) || estimatedItemHeight || itemHeight;
          }
        } else {
          scrollTo = index * itemHeight;
        }

        // Adjust based on alignment
        if (align === 'center') {
          scrollTo -= (containerHeight - itemHeight) / 2;
        } else if (align === 'end') {
          scrollTo -= containerHeight - itemHeight;
        }

        containerRef.current.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth',
        });
      },
      [
        itemHeight,
        containerHeight,
        variableHeight,
        itemHeights,
        estimatedItemHeight,
      ]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      e => {
        if (!items.length) return;

        const currentIndex = Math.floor(scrollTop / itemHeight);
        let newIndex = currentIndex;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            newIndex = Math.max(0, currentIndex - 1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            newIndex = Math.min(items.length - 1, currentIndex + 1);
            break;
          case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            newIndex = items.length - 1;
            break;
          case 'PageUp':
            e.preventDefault();
            newIndex = Math.max(
              0,
              currentIndex - Math.floor(containerHeight / itemHeight)
            );
            break;
          case 'PageDown':
            e.preventDefault();
            newIndex = Math.min(
              items.length - 1,
              currentIndex + Math.floor(containerHeight / itemHeight)
            );
            break;
          default:
            return;
        }

        scrollToItem(newIndex);
      },
      [scrollTop, itemHeight, items.length, containerHeight, scrollToItem]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className={`virtualized-list ${className} ${isScrolling ? 'scrolling' : ''}`}
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative',
        }}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="listbox"
        aria-rowcount={items.length}
        {...props}
      >
        {/* Total height container */}
        <div
          style={{
            height: totalHeight,
            position: 'relative',
            pointerEvents: 'none',
          }}
        >
          {/* Visible items */}
          <AnimatePresence>
            {visibleItems.map(({ item, index, offsetY }) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: offsetY,
                  left: 0,
                  right: 0,
                  height: variableHeight ? 'auto' : itemHeight,
                  pointerEvents: 'auto',
                }}
              >
                <VirtualListItem
                  item={item}
                  index={index}
                  renderItem={renderItem}
                  isVisible={true}
                  measureRef={createMeasureRef(index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading indicator */}
        {isScrolling && (
          <div className="virtual-list-scrolling-indicator">
            <div className="scrolling-spinner" />
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="virtual-list-empty">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }
);

// PropTypes
VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  overscan: PropTypes.number,
  threshold: PropTypes.number,
  onScroll: PropTypes.func,
  estimatedItemHeight: PropTypes.number,
  variableHeight: PropTypes.bool,
};

VirtualListItem.propTypes = {
  item: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object,
  renderItem: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  measureRef: PropTypes.func,
};

// Export both components
export { VirtualListItem };
export default VirtualizedList;
