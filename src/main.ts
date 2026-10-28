import './ui/demo/pilot-scene.css';
import { audio } from './systems/AudioSystem';
import './styles/main.css';
import './styles/story-demo.css';
import './styles/internal-ui.css';
import './styles/cartoon-ui.css';
import { App } from './ui/App';

const app = new App(document.getElementById('stage')!, document.getElementById('ui')!);
audio.mount();
app.start();
// acesso para depuração e testes automatizados
(window as any).__missaodf = app;
