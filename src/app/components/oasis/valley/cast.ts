// Who lives in the valley. Each villager appears when their level is finished
// (-2 = always there). Positions are in valley coordinates.

import type { VillagerSpec } from './Characters';
import { PLOT, PLOT_GATE, SPOTS } from './world';

const px = (dx: number) => PLOT.x + dx;
const pz = (dz: number) => PLOT.z + dz;

export const VILLAGERS: VillagerSpec[] = [
  // an elder resting by the spring
  { look: 'elder', level: -2, at: [SPOTS.spring.x + 0.9, SPOTS.spring.y + 1.05], anim: 'Sit_Floor_Idle', face: -0.4 },
  // your shop in the old quarter
  { look: 'man', level: 1, at: [SPOTS.shop.x + 0.75, SPOTS.shop.y + 0.95], anim: 'Interact', face: -0.7, phase: 0.3 },
  { look: 'elder', level: 1, at: [SPOTS.shop.x - 0.8, SPOTS.shop.y + 0.85], anim: 'Sit_Floor_Idle', face: 0.5 },
  // guards at the fort gate
  { look: 'man', level: 2, at: [SPOTS.fort.x - 0.4, SPOTS.fort.y + 2.35], anim: 'Idle', face: 0 },
  { look: 'man', level: 2, at: [SPOTS.fort.x + 0.4, SPOTS.fort.y + 2.35], anim: 'Idle', face: 0, phase: 0.5 },
  // a walk along the new road
  { look: 'woman', level: 3, at: [5.6, 5.55], to: [8.6, 6.25], phase: 0.2 },
  // the workshop
  { look: 'man', level: 4, at: [SPOTS.workshop.x - 0.4, SPOTS.workshop.y + 2.35], anim: 'Use_Item', face: Math.PI },
  // the village fills up
  { look: 'woman', level: 5, at: [-8.5, 1.6], to: [-6.3, 1.9], phase: 0.6 },
  // the gardens
  { look: 'man', level: 6, at: [10.4, 0.5], anim: 'PickUp', face: 0.8 },
  { look: 'woman', level: 6, at: [9.6, -1.4], to: [12.6, -0.3], phase: 0.1 },
  // the souq
  { look: 'man', level: 7, at: [SPOTS.souq.x - 0.6, SPOTS.souq.y + 2.1], anim: 'Interact', face: Math.PI, phase: 0.4 },
  { look: 'woman', level: 7, at: [SPOTS.souq.x - 1.6, SPOTS.souq.y + 2.3], to: [SPOTS.souq.x + 1.8, SPOTS.souq.y + 2.4], phase: 0.8 },
  // your plot: the team (level 5) and customers (level 7)
  { look: 'man', level: 5, at: [px(-0.35), pz(0.1)], anim: 'Use_Item', face: -1.2 },
  { look: 'woman', level: 5, at: [px(1.0), pz(0.05)], anim: 'Interact', face: Math.PI, phase: 0.7 },
  { look: 'elder', level: 7, at: [PLOT_GATE.x, PLOT_GATE.y - 0.7], to: [PLOT_GATE.x, pz(0.0)], phase: 0.3 },
  { look: 'woman', level: 7, at: [px(0.5), pz(0.0)], anim: 'Idle', face: Math.PI, phase: 0.2 },
];
