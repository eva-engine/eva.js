import VConsole from 'vconsole';

type ExampleModule = () => Promise<{
  name: string;
  init: (canvas: HTMLCanvasElement) => void;
}>;
// @ts-ignore
const modules: Record<string, ExampleModule> = import.meta.glob('./src/*.ts');

window.addEventListener('hashchange', () => {
  location.reload();
})

const path = location.hash.replace('#', '');
if (modules[path]) {
  (async () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
    const module = await modules[path]();
    document.title = module.name;
    module.init(canvas);
  })();
  if (/android|phone|mobile|ipad/i.test(navigator.userAgent) && location.search.length < 1) {
    new VConsole();
  }
} else {
  const ul = document.createElement('ul');
  Object.keys(modules).forEach(url => {
    const li = document.createElement('li');
    ul.appendChild(li);
    const link = document.createElement('a');
    li.appendChild(link);
    const pathname = url.split('/').pop().split('.ts')[0];
    link.href = `#${url}`
    link.innerText = pathname;
    link.addEventListener('click', () => location.hash = url);
  })
  document.body.appendChild(ul);
}
