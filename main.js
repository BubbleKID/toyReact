import { ToyReact, Componenet } from "./ToyReact.js";

class MyComponent extends Componenet {
  render() {
    return <div><span>asdasdasd</span>Cool</div>
  }
}

let a = <MyComponent name="a" id="abc"></MyComponent>
  
ToyReact.render(a, document.body);