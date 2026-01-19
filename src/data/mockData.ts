// Mock data for the photographer portfolio

export interface Photo {
  id: string;
  src: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  width: number;
  height: number;
}

export const carouselImages: Photo[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1519414442781-fbd745c5b497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHN1bnNldHxlbnwxfHx8fDE3NjgyNzk2ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Mountain Sunset',
    description: 'Golden hour in the mountains',
    tags: ['landscape', 'sunset', 'mountains'],
    category: 'nature',
    width: 1920,
    height: 1080,
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1532555985931-0cd8773a663c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwbmlnaHR8ZW58MXx8fHwxNzY4MzkwMzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'City Nights',
    description: 'Urban exploration after dark',
    tags: ['urban', 'night', 'city'],
    category: 'urban',
    width: 1920,
    height: 1080,
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1514747975201-4715db583da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc2ODM3NzEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Ocean Waves',
    description: 'The power and beauty of the sea',
    tags: ['ocean', 'waves', 'nature'],
    category: 'nature',
    width: 1920,
    height: 1080,
  },
];

export const galleryImages: Photo[] = [
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1654738344031-441757e8818d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjgzNTQ2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Nature Vista',
    description: 'Breathtaking landscape photography',
    tags: ['nature', 'landscape', 'vista'],
    category: 'nature',
    width: 800,
    height: 1200,
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1548566862-2c9b1fed780a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjgzMjgxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Modern Architecture',
    description: 'Urban geometry and design',
    tags: ['architecture', 'urban', 'modern'],
    category: 'urban',
    width: 800,
    height: 600,
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODMyNzM4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Portrait Study',
    description: 'Capturing human emotion',
    tags: ['portrait', 'people', 'emotion'],
    category: 'portrait',
    width: 600,
    height: 900,
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmVlc3xlbnwxfHx8fDE3NjgzMTQzODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Forest Path',
    description: 'Serenity in the woods',
    tags: ['forest', 'nature', 'trees'],
    category: 'nature',
    width: 900,
    height: 600,
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1617214922084-5db8d3c3df5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4MzY1ODg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Minimal Interior',
    description: 'Clean lines and simplicity',
    tags: ['interior', 'minimal', 'design'],
    category: 'interior',
    width: 800,
    height: 800,
  },
  ...carouselImages,
];

export const categories = [
  { id: 'all', name: 'All Work', count: galleryImages.length },
  { id: 'nature', name: 'Nature', count: galleryImages.filter(img => img.category === 'nature').length },
  { id: 'urban', name: 'Urban', count: galleryImages.filter(img => img.category === 'urban').length },
  { id: 'portrait', name: 'Portrait', count: galleryImages.filter(img => img.category === 'portrait').length },
  { id: 'interior', name: 'Interior', count: galleryImages.filter(img => img.category === 'interior').length },
];
