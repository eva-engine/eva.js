type ExampleModule = {
  name:string,
  init:(canvas:HTMLCanvasElement)=>void
}
//@ts-ignore
const modules:{[key:string]:ExampleModule} = import.meta.globEager('./ts/*.ts');
const moduleEntries = Object.entries(modules);
declare const canvas: HTMLCanvasElement;
const path = location.hash.replace('#', '');
window.onhashchange = e=>{
  location.reload();
}
if (modules[path]) {
  modules[path].init(canvas);
} else {
  canvas.remove();
  moduleEntries.forEach(([url,{name = url}])=>{
    let btn = document.createElement('button');
    btn.innerText = name;
    btn.onclick = () => {
      location.hash = url;
    };
    document.body.appendChild(btn);
  });
}