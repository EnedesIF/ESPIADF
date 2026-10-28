import {DEMO_JOURNEY} from '@/data/demoJourney';
const KEY='missaodf:demo-journey:v1';
export function demoStory(){try{return JSON.parse(localStorage.getItem(KEY)||'{"current":1,"visited":[1]}') as {current:number;visited:number[]}}catch{return {current:1,visited:[1]}}}
export function storyStep(n:number){if(!DEMO_JOURNEY.some(s=>s.id===n))return;const s=demoStory();s.current=n;if(!s.visited.includes(n))s.visited.push(n);localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new Event('demo-story-step'))}
