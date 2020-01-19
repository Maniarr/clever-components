import '../atoms/cc-input-text.js';
import warningSvg from 'twemoji/2/svg/26a0.svg';
import { css, html, LitElement } from 'lit-element';
import { dispatchCustomEvent } from '../lib/events.js';
import { ERROR_TYPES, parseRaw, toNameEqualsValueString } from '@clevercloud/client/esm/utils/env-vars.js';
import { i18n } from '../lib/i18n.js';
import { iconStyles } from '../styles/icon.js';

/**
 * A high level environment variable editor to create/edit/delete all variables at once as a big string (properly parsed with validation and error messages).
 *
 * ## Type definitions
 *
 * ```js
 * interface Variable {
 *   name: string,
 *   value: string,
 *   isDeleted: boolean,
 * }
 * ```
 *
 * @prop {Boolean} readonly - Sets `readonly` attribute on main input and hides buttons.
 * @prop {Boolean} disabled - Sets `disabled` attribute on inputs and buttons.
 * @prop {Variable[]} variables - Sets the list of variables.
 *
 * @event {CustomEvent<Variable[]>} env-var-editor-expert:change - Fires the new list of variables whenever something changes in the list.
 */
export class EnvVarEditorExpert extends LitElement {

  static get properties () {
    return {
      disabled: { type: Boolean },
      readonly: { type: Boolean },
      variables: { type: Array, attribute: false },
      _variablesAsText: { type: Array, attribute: false },
      _formattedErrors: { type: Array, attribute: false },
      _skeleton: { type: Boolean, attribute: false },
    };
  }

  constructor () {
    super();
    // Triggers setter (init _skeleton, _variablesAsText and _errors)
    this.variables = null;
    this.disabled = false;
    this.readonly = false;
  }

  static get skeletonVariables () {
    return [
      { name: 'VARIABLE_ONE', value: '' },
      { name: 'VARIABLE_FOOBAR', value: '' },
      { name: 'VARIABLE_PORT', value: '' },
    ];
  }

  set variables (variables) {

    this._skeleton = (variables == null);
    const vars = this._skeleton ? EnvVarEditorExpert.skeletonVariables : variables;

    const filteredVariables = vars
      .filter(({ isDeleted }) => !isDeleted);
    this._variablesAsText = toNameEqualsValueString(filteredVariables);
    this._errors = [];
  }

  set _errors (rawErrors) {
    this._formattedErrors = rawErrors.map(({ type, name, pos }) => {
      if (type === ERROR_TYPES.INVALID_NAME) {
        return {
          line: pos.line,
          msg: i18n('env-var-editor-expert.errors.invalid-name', { name }),
        };
      }
      if (type === ERROR_TYPES.DUPLICATED_NAME) {
        return {
          line: pos.line,
          msg: i18n('env-var-editor-expert.errors.duplicated-name', { name }),
        };
      }
      if (type === ERROR_TYPES.INVALID_LINE) {
        return {
          line: pos.line,
          msg: i18n('env-var-editor-expert.errors.invalid-line'),
        };
      }
      if (type === ERROR_TYPES.INVALID_VALUE) {
        return {
          line: pos.line,
          msg: i18n('env-var-editor-expert.errors.invalid-value'),
        };
      }
      return { line: '?', msg: i18n('env-var-editor-expert.errors.unknown') };
    });
  }

  _onInput ({ detail: value }) {
    const { variables, errors } = parseRaw(value);
    console.log(variables);
    this._errors = errors;
    if (errors.length === 0) {
      dispatchCustomEvent(this, 'change', variables);
    }
  }

  render () {

    const placeholder = this.readonly
      ? i18n('env-var-editor-expert.placeholder-readonly')
      : i18n('env-var-editor-expert.placeholder');

    return html`
      <cc-input-text
        multi
        clipboard
        value=${this._variablesAsText}
        placeholder=${placeholder}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this._skeleton}
        @cc-input-text:input=${this._onInput}
      ></cc-input-text>
      
      <ul class="error-list" ?hidden=${this._formattedErrors.length === 0}>
        ${this._formattedErrors.map(({ line, msg }) => html`
          <li class="error-item"><img class="icon-img" src=${warningSvg} alt=""><strong>${i18n('env-var-editor-expert.errors.line')} ${line}:</strong> ${msg}</li>
        `)}
      </ul>
    `;
  }

  static get styles () {
    return [
      iconStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none;
        }

        .error-list {
          margin: 0.5rem 0.2rem 0.2rem;
          padding: 0;
          list-style: none;
        }

        .error-item {
          margin: 0;
          padding: 0.25rem 0;
          line-height: 1.75;
        }

        /* i18n error message may contain <code> tags */
        .error-item code {
          background-color: #f3f3f3;
          border-radius: 0.25rem;
          font-family: "SourceCodePro", "monaco", monospace;
          padding: 0.15rem 0.3rem;
        }
      `,
    ];
  }
}

window.customElements.define('env-var-editor-expert', EnvVarEditorExpert);
