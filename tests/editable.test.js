import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import $ from "jquery";
import editable from "../src/editable.js";

beforeAll(() => {
    editable($);
});

describe("$.fn.editable", () => {
    let $el;

    beforeEach(() => {
        $el = $('<td>Hello</td>').appendTo(document.body);
    });

    afterEach(() => {
        $el.off(".editable").remove();
    });

    describe("initialization", () => {
        it("returns a fluent API object", () => {
            const api = $el.editable();
            expect(api).toHaveProperty("start");
            expect(api).toHaveProperty("change");
            expect(api).toHaveProperty("save");
            expect(api).toHaveProperty("saved");
            expect(api).toHaveProperty("error");
            expect(api).toHaveProperty("cancel");
            expect(api).toHaveProperty("destroy");
            expect(api).toHaveProperty("elements");
        });

        it(".elements() returns the original jQuery set", () => {
            const api = $el.editable();
            expect(api.elements().is($el)).toBe(true);
        });

        it("exposes $.fn.editable.defaults", () => {
            expect($.fn.editable.defaults).toBeDefined();
            expect($.fn.editable.defaults.mode).toBe("contenteditable");
            expect($.fn.editable.defaults.trigger).toBe("dblclick");
        });
    });

    describe("recovery", () => {
        it("stores original text on init", () => {
            $el.editable();
            expect($.data($el[0], "editable-original")).toBe("Hello");
        });

        it("does not store original text when recoverable is false", () => {
            $el.editable({ recoverable: false });
            expect($.data($el[0], "editable-original")).toBeUndefined();
        });
    });

    describe("contenteditable mode", () => {
        it("adds editingClass and contenteditable on trigger", () => {
            $el.editable({ trigger: "click" });
            $el.trigger("click");
            expect($el.hasClass("ce-editing")).toBe(true);
            expect($el.attr("contenteditable")).toBe("true");
        });

        it("does not fire onStart twice on repeated triggers", () => {
            const onStart = vi.fn();
            $el.editable({ trigger: "click", onStart });
            $el.trigger("click");
            $el.trigger("click");
            expect(onStart).toHaveBeenCalledOnce();
        });

        it("removes errorClass when editing starts", () => {
            $el.addClass("ce-error").editable({ trigger: "click" });
            $el.trigger("click");
            expect($el.hasClass("ce-error")).toBe(false);
        });
    });

    describe("input mode", () => {
        it("replaces content with an input on trigger", () => {
            $el.editable({ mode: "input", trigger: "click" });
            $el.trigger("click");
            expect($el.find("input.ce-input").length).toBe(1);
            expect($el.find("input.ce-input").val()).toBe("Hello");
        });

        it("adds editingClass in input mode", () => {
            $el.editable({ mode: "input", trigger: "click" });
            $el.trigger("click");
            expect($el.hasClass("ce-editing")).toBe(true);
        });

        it("applies custom inputClass", () => {
            $el.editable({ mode: "input", trigger: "click", inputClass: "my-input" });
            $el.trigger("click");
            expect($el.find("input.my-input").length).toBe(1);
        });
    });

    describe("callbacks", () => {
        it("fires onStart callback when editing starts", () => {
            const onStart = vi.fn();
            $el.editable({ trigger: "click", onStart });
            $el.trigger("click");
            expect(onStart).toHaveBeenCalledOnce();
        });

        it("fires onCancel callback on ESC", () => {
            const onCancel = vi.fn();
            $el.editable({ trigger: "click", onCancel });
            $el.trigger("click");
            $el.trigger($.Event("keydown", { keyCode: 27 }));
            expect(onCancel).toHaveBeenCalledOnce();
        });
    });

    describe("events", () => {
        it("triggers editable:start event", () => {
            const handler = vi.fn();
            $el.on("editable:start", handler);
            $el.editable({ trigger: "click" });
            $el.trigger("click");
            expect(handler).toHaveBeenCalledOnce();
        });

        it("triggers editable:cancel event on ESC", () => {
            const handler = vi.fn();
            $el.on("editable:cancel", handler);
            $el.editable({ trigger: "click" });
            $el.trigger("click");
            $el.trigger($.Event("keydown", { keyCode: 27 }));
            expect(handler).toHaveBeenCalledOnce();
        });
    });

    describe("fluent API chaining", () => {
        it("all methods return the api object", () => {
            const api = $el.editable();
            expect(api.start(() => {})).toBe(api);
            expect(api.change(() => {})).toBe(api);
            expect(api.save(() => {})).toBe(api);
            expect(api.saved(() => {})).toBe(api);
            expect(api.error(() => {})).toBe(api);
            expect(api.cancel(() => {})).toBe(api);
        });
    });

    describe("destroy", () => {
        it("removes all plugin classes", () => {
            const api = $el.editable({ trigger: "click" });
            $el.trigger("click");
            api.destroy();
            expect($el.hasClass("ce-editing")).toBe(false);
            expect($el.hasClass("ce-saving")).toBe(false);
            expect($el.hasClass("ce-saved")).toBe(false);
            expect($el.hasClass("ce-error")).toBe(false);
        });

        it("removes contenteditable attribute", () => {
            const api = $el.editable({ trigger: "click" });
            $el.trigger("click");
            api.destroy();
            expect($el.attr("contenteditable")).toBeUndefined();
        });

        it("restores original text", () => {
            const api = $el.editable({ trigger: "click" });
            $el.trigger("click");
            $el[0].textContent = "Changed text";
            api.destroy();
            expect($el.text()).toBe("Hello");
        });

        it("unbinds plugin events after destroy", () => {
            const onStart = vi.fn();
            const api = $el.editable({ trigger: "click", onStart });
            api.destroy();
            $el.trigger("click");
            expect(onStart).not.toHaveBeenCalled();
        });
    });
});
