/**
 * @author mrdoob / http://mrdoob.com/
 */

const Stats = function(style) {
  style = {...{width: 20, height: 12, x: 0, y: 0}, ...style};
  const {width, height, x, y} = style;
  let mode = 0;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000;width: ${width}vw;height: ${height}vw;left: ${x}vw;top: ${y}vw;`;
  container.addEventListener(
    'click',
    function(event) {
      event.preventDefault();
      showPanel(++mode % container.children.length);
    },
    false,
  );

  function addPanel(panel) {
    container.appendChild(panel.dom);
    return panel;
  }

  function showPanel(id) {
    for (let i = 0; i < container.children.length; i++) {
      // @ts-ignore
      container.children[i].style.display = i === id ? 'block' : 'none';
    }

    mode = id;
  }

  let beginTime = (performance || Date).now(),
    prevTime = beginTime,
    frames = 0;

  const fpsPanel = addPanel(Stats.Panel('FPS', '#0ff', '#002'));
  const msPanel = addPanel(Stats.Panel('MS', '#0f0', '#020'));
  let memPanel;
  // @ts-ignore
  if (self.performance && self.performance.memory) {
    memPanel = addPanel(Stats.Panel('MB', '#f08', '#201'));
  }

  showPanel(0);

  return {
    REVISION: 16,

    dom: container,

    addPanel: addPanel,
    showPanel: showPanel,

    begin: function(time) {
      beginTime = time || (performance || Date).now();
    },

    end: function() {
      frames++;

      const time = (performance || Date).now();

      msPanel.update(time - beginTime, 200);

      if (time >= prevTime + 1000) {
        fpsPanel.update((frames * 1000) / (time - prevTime), 100);

        prevTime = time;
        frames = 0;

        if (memPanel) {
          // @ts-ignore
          const memory = performance.memory;
          memPanel.update(
            memory.usedJSHeapSize / 1048576,
            memory.jsHeapSizeLimit / 1048576,
          );
        }
      }

      return time;
    },

    update: function() {
      beginTime = this.end();
    },

    // Backwards Compatibility

    domElement: container,
    setMode: showPanel,
  };
};

Stats.Panel = function(name, fg, bg) {
  let min = Infinity,
    max = 0;
  const round = Math.round;
  const PR = round(window.devicePixelRatio || 1);

  const WIDTH = 80 * PR,
    HEIGHT = 48 * PR,
    TEXT_X = 3 * PR,
    TEXT_Y = 2 * PR,
    GRAPH_X = 3 * PR,
    GRAPH_Y = 15 * PR,
    GRAPH_WIDTH = 74 * PR,
    GRAPH_HEIGHT = 30 * PR;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = 'width:100%;height:100%';

  const context = canvas.getContext('2d');
  context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
  context.textBaseline = 'top';

  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = fg;
  context.fillText(name, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  return {
    dom: canvas,

    update: function(value, maxValue) {
      min = Math.min(min, value);
      max = Math.max(max, value);

      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = fg;
      context.fillText(
        round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')',
        TEXT_X,
        TEXT_Y,
      );

      context.drawImage(
        canvas,
        GRAPH_X + PR,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
      );

      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(
        GRAPH_X + GRAPH_WIDTH - PR,
        GRAPH_Y,
        PR,
        round((1 - value / maxValue) * GRAPH_HEIGHT),
      );
    },
  };
};

export default Stats;
