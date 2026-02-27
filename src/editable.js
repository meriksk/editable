/**
 * $.fn.editable — jQuery inline plain-text editing plugin.
 *
 * Enables in-place editing of plain-text content (table cells, labels, etc.)
 * with optional AJAX save, universal event system, and configurable CSS states.
 *
 * MODES
 *   "contenteditable"  Makes the element itself editable via the contenteditable
 *                      attribute. Paste is sanitised to plain text automatically.
 *
 *   "input"            Replaces the element's content with a temporary <input>
 *                      on activation and restores it on save/cancel. Simpler and
 *                      more predictable for single-line fields.
 *
 * OPTIONS
 *   mode          {string}          Editing mode. "contenteditable" | "input".
 *                                   Default: "contenteditable"
 *   trigger       {string}          jQuery event name that activates editing.
 *                                   Default: "dblclick"
 *   url           {string|null}     POST endpoint for saving. When null, the
 *                                   editable:save event fires but no request is
 *                                   made. Default: null
 *   method        {string}          HTTP method for the AJAX request.
 *                                   Default: "POST"
 *   dataKey       {string}          Request body key for the edited text value.
 *                                   Default: "content"
 *   data          {object|function} Extra fields merged into every POST payload.
 *                                   Pass a function for per-element values — it
 *                                   is called with the element as `this` and must
 *                                   return a plain object.
 *                                   Per-element alternative: add a data-extra
 *                                   attribute containing valid JSON, e.g.
 *                                   data-extra='{"id":1,"field":"name"}'.
 *                                   Priority (lowest → highest):
 *                                     data option → data-extra attr → dataKey text
 *                                   Default: {}
 *   recoverable   {boolean}         Store the original text on init so ESC can
 *                                   restore it. Stored via $.data() — no DOM
 *                                   attribute pollution. Default: true
 *   editingClass  {string}          Class added to the element while editing.
 *                                   Default: "ce-editing"
 *   savingClass   {string}          Class added while an AJAX request is in
 *                                   flight. Default: "ce-saving"
 *   savedClass    {string}          Class added on AJAX success.
 *                                   Default: "ce-saved"
 *   savedTimeout  {number}          Milliseconds before savedClass is removed.
 *                                   0 = never remove. Default: 2000
 *   errorClass    {string}          Class added on AJAX failure. Cleared when
 *                                   the user starts editing again.
 *                                   Default: "ce-error"
 *   errorTimeout  {number}          Milliseconds before errorClass is removed.
 *                                   0 = never remove. Default: 0
 *   ajaxOptions   {object}          Extra parameters merged into the $.ajax()
 *                                   call. Use for headers, timeout, contentType,
 *                                   beforeSend, etc. The url, method, data,
 *                                   success, and error keys are always
 *                                   overridden by the plugin. Default: {}
 *   inputClass    {string}          Class added to the injected <input> element.
 *                                   Input mode only. Default: "ce-input"
 *   onStart       {function|null}   Callback fired when editing starts.
 *                                   Signature: function(text)
 *   onSave        {function|null}   Callback fired before the AJAX request (or
 *                                   instead of it when url is null).
 *                                   Signature: function(text, payload)
 *   onSaving      {function|null}   Callback fired when the AJAX request is
 *                                   dispatched. Remains active (savingClass
 *                                   applied) until success, error, or timeout.
 *                                   Signature: function(text, payload)
 *   onSaved       {function|null}   Callback fired on AJAX success.
 *                                   Signature: function(text, response)
 *   onError       {function|null}   Callback fired on AJAX failure.
 *                                   Signature: function(xhr)
 *   onCancel      {function|null}   Callback fired when ESC is pressed and the
 *                                   original content is restored.
 *                                   Signature: function()
 *
 * EVENTS (fired on the element, listenable via .on())
 *   editable:start   (text)            Editing activated.
 *   editable:save    (text, payload)   Before AJAX — or instead of it when url
 *                                      is null.
 *   editable:saving  (text, payload)   AJAX request dispatched. Active until
 *                                      editable:saved or editable:error fires.
 *   editable:saved   (text, response)  AJAX success.
 *   editable:error   (xhr)             AJAX failure.
 *   editable:cancel                    ESC pressed, original text restored.
 *
 * KEYBOARD SHORTCUTS
 *   Enter    Save and exit edit mode (no newline inserted).
 *   ESC      Cancel and restore original text.
 *   Ctrl+S   Save explicitly without moving focus.
 *
 * FLUENT API
 *   .editable() returns a chainable API object instead of the jQuery set.
 *   Use .elements() to get the original jQuery set back when needed.
 *
 *   Method      Maps to     Args passed to callback
 *   .start(fn)  onStart     (text)
 *   .change(fn) onSave      (text, payload)   — fired when content changes
 *   .save(fn)   onSaving    (text, payload)   — fired when AJAX is dispatched
 *   .saved(fn)  onSaved     (text, response)  — fired on AJAX success
 *   .error(fn)  onError     (xhr)
 *   .cancel(fn) onCancel    ()
 *   .destroy()  —           unbinds all plugin events, cleans up data/classes
 *   .elements() —           returns the original jQuery set
 *
 * USAGE
 *   // Register the plugin with your jQuery instance
 *   import $ from 'jquery';
 *   import editable from '@meriksk/editable';
 *   editable($);
 *
 *   // Override defaults globally
 *   $.fn.editable.defaults.url = "/save";
 *   $.fn.editable.defaults.savedTimeout = 5000;
 *
 *   // Fluent API
 *   $("td.editable").editable({ url: "/save" })
 *       .change(function (text) { console.log("changed:", text); })
 *       .saved(function (text, response) { console.log("saved:", response); })
 *       .error(function (xhr) { alert("Save failed"); })
 *       .cancel(function () { console.log("cancelled"); });
 *
 *   // Escape back to jQuery set
 *   var $els = $("td.editable").editable().elements();
 *   $els.addClass("my-class");
 *
 *   // With AJAX save and per-element data from data-* attributes
 *   $("td[data-field]").editable({
 *       url:"/admin/content/save",
 *       data: function () {
 *           return { id: $(this).data("id"), field: $(this).data("field") };
 *       },
 *   }).change(function (text, payload) {
 *       console.log("saving", payload);
 *   });
 *
 *   // Input mode with custom classes
 *   $(".label").editable({
 *       mode: "input",
 *       inputClass: "form-control form-control-sm",
 *       editingClass: "is-editing",
 *       savedClass: "is-saved",
 *       url: "/save",
 *   });
 *
 *   // Listening to DOM events directly
 *   $(".label").editable().elements().on("editable:saved", function (e, text, response) {
 *       console.log("saved:", text, response);
 *   });
 */
export default function editable($) {
    $.fn.editable = function (options) {
        var $this = $(this);

        var settings = $.extend({}, $.fn.editable.defaults, options);

        var methods = {
            init: function () {
                this.makeRecoverable();
                this.bindEvents();
            },

            makeRecoverable: function () {
                if (!settings.recoverable) {
                    return;
                }
                $this.each(function () {
                    $.data(this, 'editable-original', $(this).text());
                });
            },

            getText: function (el) {
                if (settings.mode === 'input') {
                    return (
                        $(el)
                            .find('.' + settings.inputClass)
                            .val() || ''
                    );
                }
                return $(el).text();
            },

            startEditing: function (el) {
                if ($(el).hasClass(settings.editingClass)) {
                    return;
                }
                $(el).removeClass(settings.errorClass).addClass(settings.editingClass);

                if (settings.mode === 'input') {
                    var text = $(el).text();
                    var $input = $('<input type="text">').addClass(settings.inputClass).val(text);
                    $(el).empty().append($input);
                    methods.bindInputEvents($input, el);
                    $input.focus().select();
                } else {
                    $(el).attr('contenteditable', 'true').focus();
                }

                $(el).trigger('editable:start', [$(el).text()]);
                if (typeof settings.onStart === 'function') {
                    settings.onStart.call(el, $(el).text());
                }
            },

            stopEditing: function (el) {
                if (settings.mode === 'input') {
                    var val =
                        $(el)
                            .find('.' + settings.inputClass)
                            .val() || '';
                    $(el)
                        .find('.' + settings.inputClass)
                        .remove();
                    $(el).text(val);
                } else {
                    $(el).removeAttr('contenteditable');
                }
                $(el).removeClass(settings.editingClass);
            },

            recoverContent: function (el) {
                var original = $.data(el, 'editable-original') || '';
                if (settings.mode === 'input') {
                    $(el)
                        .find('.' + settings.inputClass)
                        .remove();
                }
                $(el)
                    .text(original)
                    .removeAttr('contenteditable')
                    .removeClass(settings.editingClass);
                $(el).trigger('editable:cancel');
                if (typeof settings.onCancel === 'function') {
                    settings.onCancel.call(el);
                }
            },

            isDirty: function (el) {
                return methods.getText(el) !== $.data(el, 'editable-original');
            },

            saveContent: function (el) {
                if ($(el).hasClass(settings.savingClass)) {
                    return;
                }
                if (!methods.isDirty(el)) {
                    methods.stopEditing(el);
                    return;
                }

                var text = methods.getText(el);
                var resolvedData =
                    typeof settings.data === 'function' ? settings.data.call(el) : settings.data;
                var elementExtra = $(el).data('extra') || {};
                var payload = $.extend({}, resolvedData, elementExtra);
                payload[settings.dataKey] = text;

                $(el).trigger('editable:save', [text, payload]);
                if (typeof settings.onSave === 'function') {
                    settings.onSave.call(el, text, payload);
                }

                if (!settings.url) {
                    $.data(el, 'editable-original', text);
                    methods.stopEditing(el);
                    return;
                }

                $(el).addClass(settings.savingClass);

                $(el).trigger('editable:saving', [text, payload]);
                if (typeof settings.onSaving === 'function') {
                    settings.onSaving.call(el, text, payload);
                }

                $.ajax(
                    $.extend({}, settings.ajaxOptions, {
                        url: settings.url,
                        method: settings.method,
                        data: payload,
                        success: function (response) {
                            $(el)
                                .removeClass(settings.savingClass + ' ' + settings.errorClass)
                                .addClass(settings.savedClass);
                            $.data(el, 'editable-original', text);
                            methods.stopEditing(el);
                            $(el).trigger('editable:saved', [text, response]);
                            if (typeof settings.onSaved === 'function') {
                                settings.onSaved.call(el, text, response);
                            }
                            if (settings.savedTimeout > 0) {
                                setTimeout(function () {
                                    $(el).removeClass(settings.savedClass);
                                }, settings.savedTimeout);
                            }
                        },
                        error: function (xhr) {
                            $(el).removeClass(settings.savingClass).addClass(settings.errorClass);
                            $(el).trigger('editable:error', [xhr]);
                            if (typeof settings.onError === 'function') {
                                settings.onError.call(el, xhr);
                            }
                            if (settings.errorTimeout > 0) {
                                setTimeout(function () {
                                    $(el).removeClass(settings.errorClass);
                                }, settings.errorTimeout);
                            }
                        },
                    })
                );
            },

            bindInputEvents: function ($input, el) {
                $input.on('focusout.editable', function () {
                    setTimeout(function () {
                        methods.saveContent(el);
                    }, 200);
                });

                $input.on('keydown.editable', function (e) {
                    if (e.keyCode === 27) {
                        methods.recoverContent(el);
                    }
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        methods.saveContent(el);
                    }
                    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                        e.preventDefault();
                        methods.saveContent(el);
                    }
                });
            },

            bindEvents: function () {
                $this.on(settings.trigger + '.editable', function () {
                    methods.startEditing(this);
                });

                if (settings.mode !== 'input') {
                    $this.on('focusout.editable', function () {
                        var el = this;
                        setTimeout(function () {
                            methods.saveContent(el);
                        }, 200);
                    });

                    $this.on('keydown.editable', function (e) {
                        if (e.keyCode === 27) {
                            methods.recoverContent(this);
                        }
                        if (e.keyCode === 13) {
                            e.preventDefault();
                            $(this).trigger('focusout');
                        }
                        if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                            e.preventDefault();
                            methods.saveContent(this);
                        }
                    });

                    $this.on('paste.editable', function (e) {
                        e.preventDefault();
                        var text = e.originalEvent.clipboardData.getData('text/plain');
                        var selection = window.getSelection();
                        if (!selection || !selection.rangeCount) {
                            return;
                        }
                        selection.deleteFromDocument();
                        selection.getRangeAt(0).insertNode(document.createTextNode(text));
                        selection.collapseToEnd();
                    });
                }
            },
        };

        var api = {
            start: function (fn) {
                settings.onStart = fn;
                return api;
            },
            change: function (fn) {
                settings.onSave = fn;
                return api;
            },
            save: function (fn) {
                settings.onSaving = fn;
                return api;
            },
            saved: function (fn) {
                settings.onSaved = fn;
                return api;
            },
            error: function (fn) {
                settings.onError = fn;
                return api;
            },
            cancel: function (fn) {
                settings.onCancel = fn;
                return api;
            },
            destroy: function () {
                $this.each(function () {
                    if ($(this).hasClass(settings.editingClass)) {
                        var original = $.data(this, 'editable-original') || '';
                        if (settings.mode === 'input') {
                            $(this)
                                .find('.' + settings.inputClass)
                                .remove();
                        }
                        $(this).text(original).removeAttr('contenteditable');
                    }
                    $(this).removeClass(
                        settings.editingClass +
                            ' ' +
                            settings.savingClass +
                            ' ' +
                            settings.savedClass +
                            ' ' +
                            settings.errorClass
                    );
                    $.removeData(this, 'editable-original');
                });
                $this.off('.editable');
                return api;
            },
            elements: function () {
                return $this;
            },
        };

        methods.init();
        return api;
    };

    $.fn.editable.defaults = {
        mode: 'contenteditable',
        trigger: 'dblclick',
        url: null,
        method: 'POST',
        dataKey: 'content',
        data: {},
        recoverable: true,
        editingClass: 'ce-editing',
        savingClass: 'ce-saving',
        savedClass: 'ce-saved',
        savedTimeout: 2000,
        errorClass: 'ce-error',
        errorTimeout: 0,
        ajaxOptions: {},
        inputClass: 'ce-input',
        onStart: null,
        onSave: null,
        onSaving: null,
        onSaved: null,
        onError: null,
        onCancel: null,
    };
}
