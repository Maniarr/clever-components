import '../atoms/cc-button.js';
import '../atoms/cc-expand.js';
import '../atoms/cc-img.js';
import downSvg from './down.svg';
import upSvg from './up.svg';
import { css, html, LitElement } from 'lit-element';
import { i18n } from '../lib/i18n.js';

/**
 * A display component with mostly HTML+CSS and a open/close toggle feature.
 *
 * @prop {String} icon - Sets the URL of the image before the title. Icon is hidden if nullish.
 * @prop {"off"|"open"|"close"} state - Sets the state of the toggle behaviour.
 */

export class CcBlock extends LitElement {

  static get properties () {
    return {
      icon: { type: String },
      state: { type: String, reflect: true },
    };
  }

  constructor () {
    super();
    this.state = 'off';
  }

  _clickToggle () {
    this.state = (this.state === 'close') ? 'open' : 'close';
  }

  _getToggleTitle () {
    return (this.state === 'close')
      ? i18n('cc-block.toggle.close')
      : i18n('cc-block.toggle.open');
  }

  render () {

    const isToggleEnabled = (this.state === 'open' || this.state === 'close');
    const isOpen = (this.state !== 'close');

    return html`
      
      <div class="head" @click=${this._clickToggle}>
        ${this.icon != null ? html`
          <cc-img src="${this.icon}"></cc-img>
        ` : ''}
        <slot name="title"></slot>
        ${isToggleEnabled ? html`
          <cc-button @cc-button:click=${this._clickToggle}
            image=${isOpen ? upSvg : downSvg}
            title="${this._getToggleTitle()}"
          ></cc-button>
        ` : ''}
      </div>
      
      ${isToggleEnabled ? html`
        <cc-expand>
          ${isOpen ? html`
            <slot name="main"></slot>
          ` : ''}
        </cc-expand>
      ` : ''}
      
      ${!isToggleEnabled ? html`
        <slot name="main"></slot>
      ` : ''}
    `;
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          background-color: #fff;
          border-radius: 0.25rem;
          border: 1px solid #bcc2d1;
          box-sizing: border-box;
          display: block;
          padding: 1rem;
          overflow: hidden;
        }

        .head {
          align-items: center;
          display: flex;
        }

        :host([state="open"]) .head,
        :host([state="close"]) .head {
          margin: -1rem;
          padding: 1rem;
        }

        :host([state="open"]) .head:hover,
        :host([state="close"]) .head:hover {
          background-color: #fafafa;
          cursor: pointer;
        }

        cc-img {
          border-radius: 0.25rem;
          margin-right: 1rem;
          height: 1.5rem;
          width: 1.5rem;
        }

        ::slotted([slot="title"]) {
          color: #3A3871;
          flex: 1 1 0;
          font-size: 1.2rem;
          font-weight: bold;
        }

        ::slotted([slot="main"]) {
          display: grid;
          grid-gap: 1rem;
          margin-top: 1.5rem;
        }
      `,
    ];
  }
}

window.customElements.define('cc-block', CcBlock);