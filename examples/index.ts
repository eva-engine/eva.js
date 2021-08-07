import VConsole from 'vconsole';

declare const canvas: HTMLCanvasElement;

type ExampleModule = () => Promise<{
  name: string;
  init: (canvas: HTMLCanvasElement) => void;
}>;

const modules: Record<string, ExampleModule> = import.meta.glob('./src/*.ts');

// const moduleEntries = Object.entries(modules);
const path = location.hash.replace('#', '');

if (/android|phone|mobile|ipad/i.test(navigator.userAgent) && location.search.length < 1) {
  try {
    new VConsole();
  } catch (e) {
    alert(e.message);
  }
}

window.onhashchange = e => {
  location.reload();
};

if (modules[path]) {
  (async () => {
    const module = await modules[path]();
    document.title = module.name;
    module.init(canvas);
  })();
} else {
  canvas.remove();
  Object.keys(modules).forEach(url => {
    let btn = document.createElement('div');
    btn.className = 'link';
    btn.innerText = url.split('/').pop().split('.ts')[0];
    btn.onclick = () => {
      location.hash = url;
    };
    document.body.appendChild(btn);
    document.body.appendChild(document.createElement('br'));
  });
}
