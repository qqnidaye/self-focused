import React from 'react';
import raf from 'raf';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import SelfFocused from '../src/self-focused';

// avoid Warning: render(): Rendering components directly into document.body is discouraged.
before(() => {
  const div = document.createElement('div');
  window.rootNode = div;
  document.body.appendChild(div);
})

Enzyme.configure({ adapter: new Adapter() });

describe('<SelfFocused />', () => {

  it('should not focus the self-focused div for the very first render', (done) => {
    mount(
      <div id="container">
        <SelfFocused/>
      </div>,
      { attachTo: window.rootNode }
    );
    raf(()=>{
      let selfFocusedDiv = window.rootNode.querySelector('#container > div');
      expect(selfFocusedDiv.getAttribute('tabindex')).to.be.null;
      expect(document.body).to.be.equal(document.activeElement);
      done();
    })
  });

  it('should focus the self-focused div for any subsequent render', (done) => {
    mount(
      <div id="container">
        <SelfFocused/>
      </div>,
      { attachTo: window.rootNode }
    );
    raf(()=>{
      let selfFocusedDiv = window.rootNode.querySelector('#container > div');
      expect(selfFocusedDiv.getAttribute('tabindex')).to.equal('-1');
      expect(selfFocusedDiv).to.be.equal(document.activeElement);
      done();
    })
  });

  it('should remove the tabindex property when self-focused <div> blurs', (done) => {
    mount(
      <div id="container">
        <SelfFocused/>
      </div>,
      { attachTo: window.rootNode }
    );
    raf(()=>{
      const selfFocusedDiv = window.rootNode.querySelector('#container > div');
      expect(selfFocusedDiv).to.be.equal(document.activeElement);
      selfFocusedDiv.addEventListener('blur', () => {
        raf(() => {
          expect(selfFocusedDiv.getAttribute('tabindex')).to.be.null;
          done();
        })
      })
      selfFocusedDiv.blur();
    })
  });

  it('should remove the tabindex property when self-focused <div> is clicked', (done) => {
    mount(
      <div id="container">
        <SelfFocused/>
      </div>,
      { attachTo: window.rootNode }
    );
    raf(()=>{
      const selfFocusedDiv = window.rootNode.querySelector('#container > div');
      expect(selfFocusedDiv).to.be.equal(document.activeElement);
      selfFocusedDiv.addEventListener('click', () => {
        raf(() => {
          expect(selfFocusedDiv.getAttribute('tabindex')).to.be.null;
          done();
        })
      })
      selfFocusedDiv.click();
    })
  });

  it('should focus the top most self-focused div on render', (done) => {
    mount(
      <div id="one">
        <SelfFocused>
          <div id="two">
            <SelfFocused/>
          </div>
        </SelfFocused>
      </div>,
      { attachTo: window.rootNode }
    );
    raf(()=>{
      let selfFocusedDiv = window.rootNode.querySelector('#one > div');
      expect(selfFocusedDiv).to.be.equal(document.activeElement);
      done();
    })
  });

  it('should focus the child most self-focused div on update', (done) => {
    class App extends React.Component {
      constructor(props) {
        super(props);
      }
      render() {
        return (
          <div id="one">
            <SelfFocused>
              <div id="two">
                <SelfFocused/>
              </div>
            </SelfFocused>
          </div>
        );
      }
    }

    const wrapper = mount(
      <App/>,
      { attachTo: window.rootNode }
    );

    raf(()=>{
      wrapper.instance().forceUpdate();
      raf(() => {
        let selfFocusedDiv = window.rootNode.querySelector('#two > div');
        expect(selfFocusedDiv).to.be.equal(document.activeElement);
      })
      done();
    })
  });

});
