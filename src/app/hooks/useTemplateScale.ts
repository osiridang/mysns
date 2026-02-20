import { useState, useEffect, RefObject } from 'react';
import { TEMPLATE_DIMENSIONS } from '@/constants';

export function useTemplateScale(
  containerRef: RefObject<HTMLDivElement | null>,
  selectedTemplate: string
) {
  const [scale, setScale] = useState(1);
  const [containerPadding, setContainerPadding] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const { width: templateWidth, height: templateHeight } = TEMPLATE_DIMENSIONS;

      let paddingPercent = 0.02;
      if (containerWidth >= 1024) paddingPercent = 0.06;
      else if (containerWidth >= 768) paddingPercent = 0.04;
      else if (containerWidth >= 640) paddingPercent = 0.03;

      const padding = Math.max(
        containerWidth * paddingPercent,
        containerHeight * paddingPercent
      );
      const topPadding = padding * 0.15;
      setContainerPadding(topPadding);

      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;
      const scaleByWidth = availableWidth / templateWidth;
      const scaleByHeight = availableHeight / templateHeight;
      const newScale = Math.min(scaleByWidth, scaleByHeight, 1);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [selectedTemplate, containerRef]);

  return { scale, containerPadding };
}
