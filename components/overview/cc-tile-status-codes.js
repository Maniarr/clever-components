import '../atoms/cc-button.js';
import Chart from 'chart.js';
import closeSvg from './close.svg';
import infoSvg from './info.svg';
import warningSvg from 'twemoji/2/svg/26a0.svg';
import { cache } from 'lit-html/directives/cache';
import { classMap } from 'lit-html/directives/class-map';
import { css, html, LitElement } from 'lit-element';
import { i18n } from '../lib/i18n.js';
import { iconStyles } from '../styles/icon.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { skeleton } from '../styles/skeleton.js';
import { STATUS_CODES } from 'statuses';
import { tileStyles } from '../styles/info-tiles.js';

function xor (a, b) {
  return Number(a) ^ Number(b);
}

/**
 * A "tile" component to display HTTP response status codes in a pie chart (donut)
 *
 * ## Details

 * * When `data` is null, a skeleton screen UI pattern is displayed (loading hint)
 * * A short doc is available when the (i) button is clicked
 *
 * ## Properties
 *
 * | Property       | Attribute      | Type              | Description
 * | --------       | ---------      | ----              | -----------
 * | `data`         |                | `StatusCodesData` | Status codes data
 * | `error`        | `error`        | `boolean`         | display an error message
 *
 * ### `StatusCodesData`
 *
 * Object with:
 *
 * * status code number as property
 * * number of requests as value
 *
 * ```
 * {
 *   [number]: number,
 * }
 * ```
 *
 * Example:
 *
 * ```
 * {
 *   200: 5027,
 *   404: 123,
 *   500: 5,
 * }
 * ```
 *
 * *WARNING*: The "Properties" table below is broken
 *
 * @prop {Object} data - BROKEN
 * @attr {Boolean} error - display an error message
 */
export class CcTileStatusCodes extends LitElement {

  static get properties () {
    return {
      data: { type: Object, attribute: false },
      error: { type: Boolean, reflect: true },
      _skeleton: { type: Boolean, attribute: false },
      _empty: { type: Boolean, attribute: false },
      _docs: { type: Boolean, attribute: false },
    };
  }

  constructor () {
    super();
    this.statusCodes = null;
    this._docs = false;
  }

  static get skeletonStatusCodes () {
    return { 200: 1 };
  }

  static get COLORS () {
    return {
      1: '#bbb',
      2: '#30ab61',
      3: '#365bd3',
      4: '#ff9f40',
      5: '#cf3942',
    };
  }

  get statusCodes () {
    return this._statusCodes;
  }

  set statusCodes (rawValue) {

    this._skeleton = (rawValue == null);

    const value = this._skeleton
      ? CcTileStatusCodes.skeletonStatusCodes
      : rawValue;

    this._statusCodes = value;

    this._empty = Object.keys(value).length === 0;

    // Raw status codes
    this._labels = Object.keys(value);

    // Status codes as categories (2xx, 3xx...)
    this._chartLabels = this._skeleton
      ? this._labels.map(() => '???')
      : this._labels.map((statusCode) => statusCode[0] + 'xx');

    this._data = Object.values(value);

    this._backgroundColor = this._skeleton
      ? this._labels.map(() => '#bbb')
      : this._labels.map((statusCode) => CcTileStatusCodes.COLORS[statusCode[0]]);

    this.updateComplete.then(() => {
      this._chart.options.animation.duration = this._skeleton ? 0 : 300;
      this._chart.options.tooltips.enabled = !this._skeleton;
      this._chart.data = {
        labels: this._chartLabels,
        datasets: [{
          data: this._data,
          backgroundColor: this._backgroundColor,
        }],
      };
      this._chart.update();
    });
  }

  _onToggleDocs () {
    this._docs = !this._docs;
  }

  render () {

    const displayChart = (!this.error && !this._empty && !this._docs);
    const displayError = (this.error && !this._docs);
    const displayEmpty = (this._empty && !this._docs);
    const displayDocs = (this._docs);

    return html`
      <div class="tile_title tile_title--image">
        ${i18n('cc-tile-status-codes.title')}
        <cc-button
          class="docs-toggle"
          image=${displayDocs ? closeSvg : infoSvg}
          title=${ifDefined(!displayDocs ? i18n('cc-tile-status-codes.about') : undefined)}
          @cc-button:click=${this._onToggleDocs}
        ></cc-button>
      </div>

      ${cache(displayChart ? html`
        <div class="tile_body">
          <!-- https://www.chartjs.org/docs/latest/general/responsive.html -->
          <div class="chart-container ${classMap({ skeleton: this._skeleton })}">
            <canvas id="chart"></canvas>
          </div>
        </div>
      ` : '')}
        
      ${displayEmpty ? html`
        <div class="tile_message">${i18n('cc-tile-status-codes.empty')}</div>
      ` : ''}
      
      ${displayError ? html`
        <div class="tile_message"><img class="icon-img" src=${warningSvg} alt="">${i18n('cc-tile-status-codes.error')}</div>
      ` : ''}
      
      <div class="tile_docs ${classMap({ 'tile_docs--hidden': !displayDocs })}">
        <p>${i18n('cc-tile-status-codes.docs.msg')}</p>
        <p><a class="tile_docs_link" href="${i18n('cc-tile-status-codes.docs.link.href')}" target="_blank">${i18n('cc-tile-status-codes.docs.link.title')}</a></p>
      </div>
    `;
  }

  firstUpdated () {

    this._ctx = this.renderRoot.getElementById('chart');
    this._chart = new Chart(this._ctx, {
      type: 'doughnut',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          onClick: function (e, legendItem) {
            const meta = this.chart.getDatasetMeta(0);
            this.chart.data.labels.forEach((label, i) => {
              const sameLabel = (label === legendItem.text);
              if (xor(e.shiftKey, sameLabel)) {
                meta.data[i].hidden = !meta.data[i].hidden;
              }
            });
            this.chart.update();
          },
          onHover: (e) => {
            this._ctx.style.cursor = 'pointer';
          },
          onLeave: (e) => {
            this._ctx.style.cursor = null;
          },
          position: 'right',
          labels: {
            fontFamily: 'monospace',
            usePointStyle: true,
            // Filter legend items so we can only keep 1xx, 2xx... instead of all status codes
            filter (current, all) {
              const label = current.text;
              const previousLabel = all.labels[current.index - 1];
              return label !== previousLabel;
            },
          },
        },
        plugins: {
          datalabels: {
            display: false,
          },
        },
        tooltips: {
          backgroundColor: '#000',
          displayColors: false,
          callbacks: {
            // Add official english title of the HTTP status code
            title: (tooltipItem, data) => {
              const statusCode = this._labels[tooltipItem[0].index];
              return `HTTP ${statusCode}: ${STATUS_CODES[statusCode]}`;
            },
            // Display number of requests and percentage
            label: (tooltipItem, data) => {
              const allData = data.datasets[tooltipItem.datasetIndex].data;
              const total = allData.reduce((a, b) => a + b, 0);
              const value = allData[tooltipItem.index];
              const percent = value / total;
              return i18n('cc-tile-status-codes.tooltip', { value, percent });
            },
          },
        },
        animation: {
          duration: 0,
        },
      },
    });
  }

  static get styles () {
    return [
      tileStyles,
      iconStyles,
      skeleton,
      // language=CSS
      css`
        .tile_title {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .docs-toggle {
          margin: 0 0 0 1rem;
        }

        .tile_body {
          position: relative;
        }

        .chart-container {
          /* We need this because: https://github.com/chartjs/Chart.js/issues/4156 */
          height: 100%;
          min-width: 0;
          position: absolute;
          width: 100%;
        }

        /*
          body, message and docs are placed in the same area (on top of each other)
          this way, we can just hide the docs
          and let the tile take at least the height of the docs text content
         */
        .tile_body,
        .tile_message,
        .tile_docs {
          grid-area: 2 / 1 / 2 / 1;
        }

        .tile_docs {
          align-self: center;
          font-size: 0.9rem;
          font-style: italic;
        }

        /* See above why we hide instead of display:none */
        .tile_docs.tile_docs--hidden {
          visibility: hidden;
        }

        .tile_docs_link {
          color: #2b96fd;
          text-decoration: underline;
        }
      `,
    ];
  }
}

window.customElements.define('cc-tile-status-codes', CcTileStatusCodes);
