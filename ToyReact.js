/* eslint-disable max-classes-per-file */

const RENDER_TO_DOM = Symbol('render to dom');
export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  [RENDER_TO_ROM](range) {
    this.range = range;
    this.update(range);
  }

  update() {
    const placeholder = document.createComment('plceholder');
    const range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);
    this.range.deleteContents();
    const vdom = this.render();
    vdom.mountTo(this.range);
    // placeholder.parentNode.removeChild(placeholder);
  }

  setState(state) {
    const merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" 
        && newState[p] !== null) {
          if (typeof oldState[p] !== "object" ) {
            if(oldState[p] instanceof Array) {
              oldState = [];
            } else {
              oldState = {};
            }
            oldState[p] = {};
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
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
      const eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLocaleLowerCase())
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
    const range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
  }

  [RENDER_TO_ROM](range) {
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

  get vdom () {
    return {
      type: '#text',
      contrent: Text.content
    };
  }

  [RENDER_TO_ROM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export const ToyReact = {
  createElement(type, attributes, ...children) {
    let element;

    if (typeof type === 'string') {
      element = new ElementWrapper(type);
    } else {
      element = new type;
    }

    for(const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }

    const insertChildren = () => {
      for (let child of children) {
        if (typeof child === 'object' 
        && child instanceof Array) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) {
            child = '';
          }
          if (!(child instanceof Component)
            && !(child instanceof ElementWrapper)
            && !(child instanceof TextWrapper)
          ) {
            child = String(child);
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };

    insertChildren(children);
    return element;
  },

  render(vdom, element) {
    const range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
