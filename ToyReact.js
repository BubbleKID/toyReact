/* eslint-disable max-classes-per-file */

const RENDER_TO_DOM = Symbol('render to dom');
export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this.tempRoot = null;
    this.tempRange = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  [RENDER_TO_DOM](range) {
    this.range = range;
    this.update(range);
  }

  get vdom() {
    return this.render().vdom;
  }

  rerender() {
    const oldRange = this.tempRange;
    const range = document.createRange();
    range.setStart(oldRange.startContainer, oldRange.startOffset);
    range.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](range);
  }

  update() {
    // const placeholder = document.createComment('plceholder');
    // const range = document.createRange();
    // range.setStart(this.range.endContainer, this.range.endOffset);
    // range.setEnd(this.range.endContainer, this.range.endOffset);
    // range.insertNode(placeholder);
    // this.range.deleteContents();
    // const vdom = this.render();
    // vdom.mountTo(this.range);
    // placeholder.parentNode.removeChild(placeholder);
  }

  setState(newState) {
    const merge = (oldState) => {
      Object.keys(newState).forEach((p) => {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      });
    };

    merge(this.state, newState);
    this.rerender();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type);
    this.type = type;
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLocaleLowerCase());
      this.root.addEventListener(eventName, value);
    }
    if (name === 'className') {
      this.root.setAttribute('class', value);
    }
    this.root.setAttribute(name, value);
  }

  get vdom() {
    return {
      type: this.type,
      props: this.props,
      children: this.children.map((child) => child.vdom),
    };
  }

  appendChild(vchild) {
    // const range = document.createRange();
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild);
    //   range.setEndAfter(this.root.lastChild);
    // } else {
    //   range.setStart(this.root, 0);
    //   range.setEnd(this.root, 0);
    // }
    // vchild.mountTo(range);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}
class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.content = content;
    this.root = document.createTextNode(content);
  }

  static get vdom() {
    return {
      type: '#text',
      contrent: Text.content,
    };
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export const ToyReact = {
  createElement(Type, attributes, ...children) {
    let element;

    if (typeof Type === 'string') {
      element = new ElementWrapper(Type);
    } else {
      element = new Type();
    }

    // attributes.forEach((name) => element.setAttribute(name, attributes[name]));
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }

    const insertChildren = () => {
      children.forEach((child) => {
      // for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child);
        } else {
          if (!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) {
            child = String(child);
          }

          if (typeof child === 'string' || typeof child === 'number') {
            child = new TextWrapper(child);
          }

          element.appendChild(child);
        }
      });
    };

    insertChildren(children);
    return element;
  },

  render(vdom, element) {
    const range = document.createRange();
    if (element.children && element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
