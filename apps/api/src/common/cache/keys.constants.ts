import { CACHE_PREFIXES } from './prefixes.constants';

export const CACHE_KEYS = {
  BUILDING: (id: string) => `${CACHE_PREFIXES.BUILDINGS}:${id}`,
  BUILDING_LIST: (search: any) => {
    const hash = generateHash(search);
    return `${CACHE_PREFIXES.BUILDINGS}:list:${hash}`;
  },

  USER: (id: string) => `users:${id}`,
  USER_LIST: (search: any) => {
    const hash = generateHash(search);
    return `users:list:${hash}`;
  },

  RAFFLE_NEXT: (buildingId: string) => `raffles:next:building:${buildingId}`,
  RAFFLE_HISTORY: (buildingId: string, search: any) => {
    const hash = generateHash(search);
    return `raffles:history:building:${buildingId}:${hash}`;
  },
  RAFFLE_BUILDING_LIST: (buildingId: string, search: any) => {
    const hash = generateHash(search);
    return `raffles:list:building:${buildingId}:${hash}`;
  },
};

function generateHash(obj: any) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}
