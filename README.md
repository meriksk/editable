# @meriksk/editable

jQuery inline plain-text editing plugin. Enables in-place editing of table cells, labels, or any element — with optional AJAX save, a fluent callback API, and configurable CSS states.

## Installation

```bash
npm install @meriksk/editable
```

jQuery is a peer dependency and must be installed separately:

```bash
npm install jquery
```

## Usage

Register the plugin with your jQuery instance once, then use it anywhere.

```js
import $ from 'jquery';
import editable from '@meriksk/editable';

editable($);
```

### Basic

```js
$('td.editable').editable();
```

### With AJAX save

```js
$('td.editable').editable({ url: '/save' })
    .change(function (text, payload) { console.log('saving', payload); })
    .saved(function (text, response) { console.log('saved', response); })
    .error(function (xhr) { console.error('failed', xhr); });
```

### Input mode

```js
$('.label').editable({
    mode: 'input',
    url:  '/save',
});
```

### Browser (CDN / script tag)

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="dist/editable.umd.js"></script>
<script>
    Editable($);
    $('td').editable();
</script>
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `"contenteditable"` | `"contenteditable"` or `"input"` |
| `trigger` | string | `"dblclick"` | jQuery event that activates editing |
| `url` | string\|null | `null` | POST endpoint. `null` = fire events only, no request |
| `method` | string | `"POST"` | HTTP method |
| `dataKey` | string | `"content"` | Request body key for the edited value |
| `data` | object\|function | `{}` | Extra fields merged into every POST payload |
| `recoverable` | boolean | `true` | Store original text so ESC can restore it |
| `editingClass` | string | `"ce-editing"` | Class added while editing |
| `savingClass` | string | `"ce-saving"` | Class added during AJAX request |
| `savedClass` | string | `"ce-saved"` | Class added on AJAX success |
| `savedTimeout` | number | `2000` | Ms before `savedClass` is removed. `0` = never |
| `errorClass` | string | `"ce-error"` | Class added on AJAX failure |
| `errorTimeout` | number | `0` | Ms before `errorClass` is removed. `0` = never |
| `ajaxOptions` | object | `{}` | Extra `$.ajax()` parameters |
| `inputClass` | string | `"ce-input"` | Class on the injected `<input>` (input mode only) |
| `onStart` | function\|null | `null` | `function(text)` |
| `onSave` | function\|null | `null` | `function(text, payload)` |
| `onSaving` | function\|null | `null` | `function(text, payload)` |
| `onSaved` | function\|null | `null` | `function(text, response)` |
| `onError` | function\|null | `null` | `function(xhr)` |
| `onCancel` | function\|null | `null` | `function()` |

## Fluent API

`.editable()` returns a chainable API object, not the jQuery set.

```js
const api = $('td').editable({ url: '/save' })
    .start(fn)    // onStart
    .change(fn)   // onSave  — content changed
    .save(fn)     // onSaving — AJAX dispatched
    .saved(fn)    // onSaved  — AJAX success
    .error(fn)    // onError
    .cancel(fn);  // onCancel

api.destroy();    // unbind events, clean up classes
api.elements();   // get original jQuery set back
```

## Events

```js
$('td').editable().elements()
    .on('editable:start',  (e, text) => {})
    .on('editable:save',   (e, text, payload) => {})
    .on('editable:saving', (e, text, payload) => {})
    .on('editable:saved',  (e, text, response) => {})
    .on('editable:error',  (e, xhr) => {})
    .on('editable:cancel', (e) => {});
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Save and exit |
| `ESC` | Cancel and restore original |
| `Ctrl+S` | Save without losing focus |

## Global Defaults

```js
$.fn.editable.defaults.url          = '/save';
$.fn.editable.defaults.savedTimeout = 5000;
```

## License

MIT
