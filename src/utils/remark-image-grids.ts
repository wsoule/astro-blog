import type { Root, Paragraph, Image } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Remark plugin to detect consecutive images in paragraphs and apply grid classes
 * This replaces the client-side JavaScript detection with build-time processing
 */
export function remarkImageGrids() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index: number, parent: any) => {
      if (!node.children || node.children.length === 0) {
        return;
      }

      // Find all image nodes in this paragraph
      const images: Image[] = [];
      const otherNodes: any[] = [];

      node.children.forEach((child) => {
        if (child.type === 'image') {
          images.push(child as Image);
        } else if (child.type === 'link' && child.children && child.children.some((linkChild: any) => linkChild.type === 'image')) {
          // Skip linked images - they should not be processed as gallery images
          otherNodes.push(child);
        } else if (child.type !== 'text' || (child as any).value.trim() !== '') {
          // Count non-empty text nodes and other elements as meaningful content
          otherNodes.push(child);
        }
      });

      // Only process paragraphs with 2+ images and no other meaningful content
      if (images.length >= 2 && otherNodes.length === 0) {
        // Add image-grid classes to the paragraph
        if (!node.data) {
          node.data = {};
        }
        if (!node.data.hProperties) {
          node.data.hProperties = {};
        }

        const hProperties = node.data.hProperties as Record<string, any>;
        
        // Remove any existing image-grid classes
        const existingClasses = (hProperties.class || '').split(' ').filter(Boolean);
        const filteredClasses = existingClasses.filter(cls => 
          !cls.startsWith('image-grid')
        );

        // Add the appropriate grid classes
        const gridClass = `image-grid-${Math.min(images.length, 6)}`;
        const newClasses = [...filteredClasses, 'image-grid', gridClass];
        
        hProperties.class = newClasses.join(' ');
      }
    });
  };
}

export default remarkImageGrids;
