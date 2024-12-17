import { useEffect, useRef, useState, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
  boolean
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (!container || !end) return;

    const checkScrollPosition = () => {
      if (!container) return;

      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50; // 50px buffer

      setIsAtBottom(isScrolledToBottom);
    };

    const handleScroll = () => {
      setIsUserScrolling(true);
      checkScrollPosition();
    };

    const handleWheel = () => {
      setIsUserScrolling(true);
    };

    const mutationObserver = new MutationObserver(() => {
      if (!isUserScrolling || isAtBottom) {
        end.scrollIntoView({ behavior: 'instant', block: 'end' });
      }
    });

    // Observe container for changes
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Add scroll and wheel event listeners
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('wheel', handleWheel);

    // Initial scroll to bottom
    end.scrollIntoView({ behavior: 'instant', block: 'end' });

    // Cleanup function
    return () => {
      mutationObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isUserScrolling, isAtBottom]);

  // Reset user scrolling after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isUserScrolling) {
        setIsUserScrolling(false);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [isUserScrolling]);

  return [containerRef, endRef, isUserScrolling];
}