import './cc-addon-option-form.js';
import '../molecules/cc-error.js';
import { css, html, LitElement } from 'lit-element';
import { dispatchCustomEvent } from '../lib/events.js';
import { i18n } from '../lib/i18n.js';

const KIBANA_LOGO_URL = 'https://static-assets.cellar.services.clever-cloud.com/logos/elasticsearch-kibana.svg';
const APM_LOGO_URL = 'https://static-assets.cellar.services.clever-cloud.com/logos/elasticsearch-apm.svg';

/**
 * A component that displays the available options of an elasticsearch add-on.
 *
 * * 🎨 default CSS display: `block`
 * <br>
 * 🧐 [component's source code on GitHub](https://github.com/CleverCloud/clever-components/blob/master/src/addon/cc-addon-elasticsearch-options.js)
 *
 * ## Type definitions
 *
 * ```js
 * interface Option {
 *   name: string,
 *   enabled: boolean,
 *   // Option specific params
 *   flavor: Flavor, // for "apm" and "kibana" options
 * }
 * ```
 *
 * ```js
 * interface Flavor {
 *   name: string,
 *   cpus: number,
 *   gpus: number,
 *   mem: number,
 *   microservice: boolean,
 *   monthlyCost: number,
 * }
 * ```
 *
 * ```js
 * interface Options {
 *   kibana: boolean,
 *   apm: boolean,
 * }
 * ```
 *
 * @prop {Option[]} options - List of options for this add-on.
 *
 * @event {CustomEvent<Options>} cc-addon-elasticsearch-options:submit - Fires when the form is submitted.
 */
export class CcAddonElasticsearchOptions extends LitElement {

  static get properties () {
    return {
      options: { type: Array, attribute: 'options' },
    };
  }

  constructor () {
    super();
    this.options = [];
  }

  _onFormOptionsSubmit ({ detail }) {
    dispatchCustomEvent(this, 'submit', detail);
  }

  _getApmOption ({ enabled, flavor }) {
    const description = html`
      <div class="option-details">${i18n('cc-addon-elasticsearch-options.description.apm')}</div>
      <cc-error class="option-warning">
        ${i18n('cc-addon-elasticsearch-options.warning.apm')}
        ${flavor != null ? html`
          ${i18n('cc-addon-elasticsearch-options.warning.apm.details', flavor)}
        ` : ''}
      </cc-error>`;

    return {
      title: 'APM',
      logo: APM_LOGO_URL,
      description,
      enabled,
      name: 'apm',
    };
  }

  _getKibanaOption ({ enabled, flavor }) {
    const description = html`
      <div class="option-details">${i18n('cc-addon-elasticsearch-options.description.kibana')}</div>
      <cc-error class="option-warning">
        ${i18n('cc-addon-elasticsearch-options.warning.kibana')}
        ${flavor != null ? html`
          ${i18n('cc-addon-elasticsearch-options.warning.kibana.details', flavor)}
        ` : ''}
      </cc-error>
    `;

    return {
      title: 'Kibana',
      logo: KIBANA_LOGO_URL,
      description,
      enabled,
      name: 'kibana',
    };
  }

  _getFormOptions () {
    return this.options
      .map((option) => {
        switch (option.name) {
          case 'apm':
            return this._getApmOption(option);
          case 'kibana':
            return this._getKibanaOption(option);
          default:
            return null;
        }
      })
      .filter((option) => option != null);
  }

  render () {
    const options = this._getFormOptions();
    const title = i18n('cc-addon-elasticsearch-options.title');

    return html`
      <cc-addon-option-form title="${title}" .options=${options} @cc-addon-option-form:submit="${this._onFormOptionsSubmit}">
        <div slot="description">${i18n('cc-addon-elasticsearch-options.description')}</div>
      </cc-addon-option-form>
    `;
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-elasticsearch-options', CcAddonElasticsearchOptions);
