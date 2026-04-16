export interface Room {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const ROOMS: Room[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Modern living space with comfortable seating',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=960&fit=crop',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    description: 'Serene bedroom with modern design',
    imageUrl: 'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=1920&h=960&fit=crop',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Contemporary kitchen with modern appliances',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=960&fit=crop',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    description: 'Luxurious bathroom with spa features',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&h=960&fit=crop',
  },
];
