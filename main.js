import { ToyReact, Componenet } from "./ToyReact.js";

class MyComponent extends Componenet {
  render() {
    return (
      <div>
        <span>asdasdasd</span>
        <div>
          {this.children}
        </div>
      </div>
    )
  }
}

let a = <MyComponent name="a" id="abc"></MyComponent>
  
ToyReact.render(a, document.body);